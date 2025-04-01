import { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  warning: {
    color: 'red',
    fontWeight: 'bold',
  },
  safe: {
    color: 'green',
    fontWeight: 'bold',
  }
});

const Analyser = () => {
  const [apiKey, setApiKey] = useState('');
  const [question, setQuestion] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const GEMINI_API_KEY = 'AIzaSyA4j3GjYQ1l5X7QZ3v3n3n3n3n3n3n3n3n3n';

  const analyseApiKey = async () => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const isSafe = Math.random() > 0.3;
      const riskFactors = isSafe 
        ? ['No known vulnerabilities detected', 'Proper key format', 'No exposure in public repos']
        : ['Potential exposure in recent breaches', 'Weak key format', 'Suspected key rotation needed'];

      const description = isSafe
        ? 'This API key appears to be securely generated and properly managed. It follows recommended practices for key generation and shows no signs of compromise.'
        : 'This API key shows signs of potential vulnerability. Immediate rotation is recommended. The key may have been exposed in recent breaches or follows weak generation patterns.';

      const recommendations = [
        'Always store API keys in environment variables or secure vaults',
        'Rotate keys regularly (every 90 days recommended)',
        'Implement IP restrictions where possible',
        'Monitor usage for abnormal patterns',
        'Never commit API keys to version control'
      ];

      await new Promise(resolve => setTimeout(resolve, 1500));

      setAnalysisResult({
        isSafe,
        riskFactors,
        description,
        recommendations,
        analyzedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({
        isSafe: false,
        riskFactors: ['Analysis failed - assume key is unsafe'],
        description: 'Unable to complete analysis due to an error. Treat this key as potentially compromised.',
        recommendations: [
          'Rotate this key immediately',
          'Check your key management practices',
          'Retry the analysis later'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question || !analysisResult) return;

    setChatLoading(true);
    try {
      const responses = [
        `Based on the analysis, ${analysisResult.isSafe ? 'this API key appears safe' : 'this API key shows signs of vulnerability'}. ${question.includes('rotation') ? 'Key rotation is recommended every 90 days as a security best practice.' : ''}`,
        `The security assessment indicates ${analysisResult.isSafe ? 'no immediate concerns' : 'several risk factors'}. Always monitor API key usage for anomalies.`,
        `${analysisResult.isSafe ? 'No action required' : 'Immediate rotation recommended'}. ${question.includes('store') ? 'API keys should be stored in secure environment variables or dedicated secret management systems.' : ''}`
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChatResponse(responses[Math.floor(Math.random() * responses.length)]);
    } catch (error) {
      console.error('Failed to get response:', error);
      setChatResponse('Unable to process your question at this time. Please try again later.');
    } finally {
      setChatLoading(false);
    }
  };

  const generatePdf = async () => {
    if (!analysisResult) return;

    const MyDocument = () => (
      <Document>
        <Page style={styles.page}>
          <Text style={styles.title}>API Key Security Analysis Report</Text>
          
          <View style={styles.section}>
            <Text style={styles.heading}>Analysis Summary</Text>
            <Text style={analysisResult.isSafe ? styles.safe : styles.warning}>
              Status: {analysisResult.isSafe ? 'SAFE TO USE' : 'UNSAFE - ROTATION RECOMMENDED'}
            </Text>
            <Text style={styles.text}>Analyzed at: {new Date(analysisResult.analyzedAt).toLocaleString()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Key Assessment</Text>
            <Text style={styles.text}>{analysisResult.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Risk Factors</Text>
            {analysisResult.riskFactors.map((factor, i) => (
              <Text key={i} style={styles.text}>• {factor}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Security Recommendations</Text>
            {analysisResult.recommendations.map((rec, i) => (
              <Text key={i} style={styles.text}>• {rec}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.text}>Generated by API Key Analyzer Tool</Text>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(<MyDocument />).toBlob();
    saveAs(blob, 'api-key-analysis-report.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">API Key Security Analyzer</h1>
      
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter API Key to Analyze
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sk_prod_1234567890abcdef1234567890abcdef"
          />
          <button
            onClick={analyseApiKey}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          We'll check your API key against common security vulnerabilities and best practices.
        </p>
      </div>

      {analysisResult && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          
          <div className={`p-4 mb-4 rounded-md ${analysisResult.isSafe ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className="font-bold mb-2">
              Status: <span className={analysisResult.isSafe ? 'text-green-600' : 'text-red-600'}>
                {analysisResult.isSafe ? 'Safe to Use' : 'Unsafe - Rotation Recommended'}
              </span>
            </h3>
            <p className="text-gray-700">{analysisResult.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold mb-2 text-lg">Risk Factors</h3>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.riskFactors.map((factor, i) => (
                  <li key={i} className="text-gray-700">{factor}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-lg">Recommendations</h3>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.recommendations.map((rec, i) => (
                  <li key={i} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={generatePdf}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Download Report (PDF)
            </button>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ask About API Key Security</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask about key rotation, storage, etc."
            />
            <button
              onClick={askQuestion}
              disabled={chatLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {chatLoading ? 'Asking...' : 'Ask'}
            </button>
          </div>

          {chatResponse && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-bold mb-2">Security Advice</h3>
              <p className="text-gray-700">{chatResponse}</p>
            </div>
          )}
        </div>
      )}

      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 text-yellow-800">Security Notes</h2>
        <ul className="list-disc pl-5 space-y-1 text-yellow-700">
          <li>This tool simulates API key analysis for demonstration purposes</li>
          <li>Never expose your real API keys in client-side applications</li>
          <li>Always use environment variables for API keys in production</li>
          <li>Regularly rotate your API keys as a security best practice</li>
        </ul>
      </div>
    </div>
  );
};

export default Analyser;