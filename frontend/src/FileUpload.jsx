import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const FileUpload = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [intervalId, setIntervalId] = useState(null);
  const reportRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const handleUpload = async () => {
    if (!audioFile) return;

    setIsLoading(true);
    setError('');
    setTranscript('');
    setAnalysis('');
    setTimer(60);

    const id = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(id);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    setIntervalId(id);

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const res = await axios.post(
        'https://aicallinsights-production.up.railway.app/analyze-call/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setTranscript(res.data.transcript);
      setAnalysis(res.data.analysis);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'An error occurred.'
      );
    } finally {
      setIsLoading(false);
      clearInterval(intervalId);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('call_report.pdf');
  };

  const renderAnalysis = (text) => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    const elements = [];
    let list = null;

    lines.forEach((line, idx) => {
      if (line.startsWith('###')) {
        if (list) {
          elements.push(<ul key={`ul-${idx}`}>{list}</ul>);
          list = null;
        }
        elements.push(
          <h3
            key={`h3-${idx}`}
            className="text-lg font-bold mt-4 mb-2 text-gray-800"
          >
            {line.replace('###', '').trim()}
          </h3>
        );
      } else if (line.startsWith('*')) {
        if (!list) list = [];
        list.push(
          <li key={`li-${idx}`} className="text-gray-700">
            {line.replace('*', '').trim()}
          </li>
        );
      } else {
        if (list) {
          elements.push(<ul key={`ul-${idx}`}>{list}</ul>);
          list = null;
        }
        elements.push(
          <p key={`p-${idx}`} className="text-gray-700 mt-2">
            {line}
          </p>
        );
      }
    });

    if (list) elements.push(<ul key="ul-last">{list}</ul>);

    return elements;
  };

  useEffect(() => {
    if (timer === 0) {
      clearInterval(intervalId);
    }
  }, [timer, intervalId]);

  return (
    <div className="p-6 w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Audio File</h1>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        <label
          htmlFor="file-upload"
          className="w-full md:w-[50%] border rounded bg-white h-32 flex justify-center items-center cursor-pointer text-gray-600 text-lg font-medium shadow"
        >
          {audioFile ? audioFile.name : 'Click to upload audio file'}
          <input
            id="file-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={isLoading || !audioFile}
          className={`px-6 py-3 rounded shadow min-w-[200px] text-white ${
            isLoading || !audioFile
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Processing...' : 'Upload and Analyze'}
        </button>
      </div>

      {isLoading && (
        <div className="mt-6 w-full flex flex-col items-center">
          <div className="relative w-20 h-20">
            <svg
              className="w-full h-full"
              viewBox="0 0 36 36"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="text-gray-200"
                cx="18"
                cy="18"
                r="16"
                strokeWidth="4"
                fill="none"
              />
              <circle
                className="text-blue-600"
                cx="18"
                cy="18"
                r="16"
                strokeWidth="4"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset={(timer / 30) * 100}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
              <span className="text-xl text-gray-700">{timer}s</span>
            </div>
          </div>

          <div className="mt-4 w-full max-w-xs bg-gray-200 h-2 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${(timer / 30) * 100}%` }}
            />
          </div>
        </div>
      )}

      {(transcript || analysis) && (
        <>
          <div ref={reportRef}>
            {transcript && (
              <div className="mt-10 bg-white rounded shadow p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Transcript
                </h2>
                <p className="whitespace-pre-line text-gray-700">{transcript}</p>
              </div>
            )}

            {analysis && (
              <div className="mt-10 bg-white rounded shadow p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Analysis
                </h2>
                <div className="prose max-w-none text-gray-800">
                  {renderAnalysis(analysis)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
            >
              Download PDF Report
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="mt-6 bg-red-100 p-4 rounded text-red-800">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
