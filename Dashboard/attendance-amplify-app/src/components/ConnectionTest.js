import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';

const ConnectionTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, { test, status, message, details, timestamp: Date.now() }]);
  };

  const runBasicTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Check if aws-exports exists
    try {
      const awsConfig = await import('../aws-exports.js');
      if (awsConfig.default) {
        addResult('AWS Config', 'success', 'aws-exports.js loaded successfully', {
          region: awsConfig.default.aws_project_region,
          endpoint: awsConfig.default.aws_appsync_graphqlEndpoint
        });
      } else {
        addResult('AWS Config', 'error', 'aws-exports.js exists but has no default export');
      }
    } catch (error) {
      addResult('AWS Config', 'error', 'aws-exports.js not found or invalid', error.message);
      setIsLoading(false);
      return;
    }

    // Test 2: Check Amplify configuration
    try {
      const config = Amplify.getConfig();
      if (config.API?.GraphQL?.endpoint) {
        addResult('Amplify Config', 'success', 'Amplify is configured', {
          endpoint: config.API.GraphQL.endpoint,
          region: config.API.GraphQL.region,
          authType: config.API.GraphQL.defaultAuthMode
        });
      } else {
        addResult('Amplify Config', 'error', 'Amplify configuration missing GraphQL endpoint');
      }
    } catch (error) {
      addResult('Amplify Config', 'error', 'Error reading Amplify config', error.message);
    }

    // Test 3: Direct GraphQL test
    try {
      const config = Amplify.getConfig();
      const endpoint = config.API?.GraphQL?.endpoint;
      const apiKey = config.API?.GraphQL?.apiKey;

      if (!endpoint) {
        addResult('Direct GraphQL', 'error', 'No GraphQL endpoint found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          query: `
            query ListStudents {
              listStudents {
                items {
                  id
                  name
                }
              }
            }
          `
        })
      });

      const result = await response.json();
      
      if (response.ok && !result.errors) {
        addResult('Direct GraphQL', 'success', 'GraphQL endpoint reachable', {
          status: response.status,
          itemCount: result.data?.listStudents?.items?.length || 0
        });
      } else {
        addResult('Direct GraphQL', 'error', 'GraphQL request failed', {
          status: response.status,
          errors: result.errors || [result.message || 'Unknown error']
        });
      }
    } catch (error) {
      addResult('Direct GraphQL', 'error', 'Network error connecting to GraphQL', error.message);
    }

    // Test 4: Test with Amplify client
    try {
      const { generateClient } = await import('aws-amplify/api');
      const client = generateClient();
      
      const result = await client.graphql({
        query: `
          query ListStudents {
            listStudents {
              items {
                id
                name
              }
            }
          }
        `
      });

      addResult('Amplify Client', 'success', 'Amplify GraphQL client working', {
        itemCount: result.data?.listStudents?.items?.length || 0
      });
    } catch (error) {
      addResult('Amplify Client', 'error', 'Amplify client error', error.message);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    runBasicTests();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Connection Test Results</h2>
      
      <button
        onClick={runBasicTests}
        disabled={isLoading}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Running Tests...' : 'Rerun Tests'}
      </button>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.status === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${
                result.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.test} - {result.status === 'success' ? 'PASS' : 'FAIL'}
              </h3>
              <span className="text-sm text-gray-500">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className={`mt-1 ${
              result.status === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.message}
            </p>
            {result.details && (
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Next Steps Based on Results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>If AWS Config fails:</strong> Run `amplify push` to generate aws-exports.js</li>
          <li><strong>If Amplify Config fails:</strong> Check your index.js has correct Amplify.configure()</li>
          <li><strong>If Direct GraphQL fails:</strong> Check API permissions and authentication</li>
          <li><strong>If Amplify Client fails:</strong> There might be a version compatibility issue</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;