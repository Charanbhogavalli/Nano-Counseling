'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertTriangle, Play, FileText, Database } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const CSVImporter: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'parsed' | 'uploading' | 'completed' | 'failed'>('idle');
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n');
      if (lines.length < 2) throw new Error("Empty CSV content.");

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      const rows: any[] = [];
      const required = ['exam', 'year', 'college_name', 'college_code', 'branch', 'category', 'closing_rank'];
      let validCount = 0;
      let invalidCount = 0;
      const issues: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Validation
        const missing = required.filter(f => !row[f]);
        if (missing.length > 0) {
          invalidCount++;
          if (issues.length < 5) {
            issues.push(`Line ${i + 1}: Missing fields [${missing.join(', ')}]`);
          }
        } else {
          validCount++;
          rows.push(row);
        }
      }

      setParsedRows(rows);
      setValidationSummary({
        total: validCount + invalidCount,
        valid: validCount,
        invalid: invalidCount,
        issues
      });
      setStatus('parsed');

    } catch (err: any) {
      alert("Error parsing CSV: " + err.message);
      setStatus('failed');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setCsvText(text);
        parseCSV(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setCsvText(text);
        parseCSV(text);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    
    setStatus('uploading');
    try {
      const res = await fetch('/api/admin/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows })
      });

      if (!res.ok) throw new Error('Network response failed.');
      const data = await res.json();
      
      setUploadResult(data.summary);
      setStatus('completed');
    } catch (err: any) {
      console.error(err);
      setStatus('failed');
      alert("Ingestion failed: " + err.message);
    }
  };

  const loadSampleTemplate = () => {
    const sampleCSV = `exam,year,college_name,college_code,branch,category,gender,quota,round,closing_rank,opening_rank,fees,city,state,college_type
COMEDK,2025,RV College of Engineering,RVCE,CSE,General,Co-Ed,Counseling,1,450,120,240000,Bengaluru,Karnataka,Autonomous
COMEDK,2025,BMS College of Engineering,BMSCE,CSE,General,Co-Ed,Counseling,1,980,310,228000,Bengaluru,Karnataka,Aided
EAMCET,2025,Chaitanya Bharathi Institute,CBIT,ECE,OBC,Co-Ed,Counseling,1,4800,1200,140000,Hyderabad,Telangana,Autonomous
JEE Main,2025,National Institute of Technology Trichy,NITT,CSE,General,Co-Ed,All India,1,900,150,145000,Tiruchirappalli,Tamil Nadu,Government`;
    
    setFileName('sample_counseling_data.csv');
    setCsvText(sampleCSV);
    parseCSV(sampleCSV);
  };

  return (
    <div className="space-y-6">
      <Card hoverEffect={false} className="border border-white/5 bg-brand-dark/40">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center">
              <Upload size={18} className="mr-2 text-neon-blue" />
              CSV Ingestion Pipeline
            </h3>
            <button
              onClick={loadSampleTemplate}
              className="text-xs text-neon-blue hover:underline bg-neon-blue/5 px-2.5 py-1 rounded-md border border-neon-blue/10 cursor-pointer"
            >
              Load Sample Dataset template
            </button>
          </div>

          {/* Drag and Drop Container */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative ${
              dragActive 
                ? 'border-neon-blue bg-neon-blue/5 shadow-[0_0_20px_rgba(0,210,255,0.1)]' 
                : 'border-white/10 bg-white/[0.01] hover:border-white/20'
            }`}
          >
            <input
              type="file"
              id="csv-file-upload"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <FileText size={28} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {fileName ? `Selected: ${fileName}` : 'Drag & drop cutoff CSV file here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">or click to browse local storage</p>
              </div>
              <p className="text-[10px] text-slate-500">
                Accepts standard admission rows including closing_rank, fees, college_code etc.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Validation Summary Card */}
      {status !== 'idle' && validationSummary && (
        <Card hoverEffect={false} className="border border-white/5">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Pre-Ingestion Audit Checks</h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400">Total Checked Rows</div>
                <div className="text-2xl font-bold text-white mt-1">{validationSummary.total}</div>
              </div>
              <div className="bg-safe-green/5 p-4 rounded-xl border border-safe-green/10">
                <div className="text-xs text-safe-green">Passed Validation</div>
                <div className="text-2xl font-bold text-safe-green mt-1">{validationSummary.valid}</div>
              </div>
              <div className="bg-risky-red/5 p-4 rounded-xl border border-risky-red/10">
                <div className="text-xs text-risky-red">Failed Validation</div>
                <div className="text-2xl font-bold text-risky-red mt-1">{validationSummary.invalid}</div>
              </div>
            </div>

            {validationSummary.invalid > 0 && (
              <div className="p-3.5 bg-risky-red/5 border border-risky-red/10 rounded-xl text-xs space-y-2 text-slate-300">
                <div className="font-semibold text-risky-red flex items-center">
                  <AlertTriangle size={14} className="mr-1.5" />
                  Format schema issues:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {validationSummary.issues.map((issue: string, idx: number) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {status === 'parsed' && (
              <Button
                variant="primary"
                onClick={handleImport}
                className="w-full py-3 justify-center text-xs font-semibold"
                disabled={validationSummary.valid === 0}
              >
                <Database size={14} className="mr-2" />
                Commit {validationSummary.valid} valid cutoffs to Database
              </Button>
            )}

            {status === 'uploading' && (
              <div className="flex items-center justify-center p-4">
                <svg className="animate-spin h-5 w-5 text-neon-blue mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs text-slate-400 font-mono">Writing records to Supabase storage...</span>
              </div>
            )}

            {status === 'completed' && uploadResult && (
              <div className="p-4 bg-safe-green/5 border border-safe-green/10 rounded-xl space-y-2">
                <div className="flex items-center text-safe-green text-sm font-semibold">
                  <CheckCircle2 size={16} className="mr-2" />
                  Database sync completed!
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 pt-2 font-mono">
                  <div>• Cutoffs Ingested: {uploadResult.insertedCutoffs}</div>
                  <div>• New Colleges Auto-Created: {uploadResult.createdColleges}</div>
                  <div>• Skipped/Errors: {uploadResult.errorsFound}</div>
                  <div>• Status: SUCCESS_COMMITTED_INDEXED</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
