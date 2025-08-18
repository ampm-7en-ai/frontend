
import React from 'react';
import { RequestExample, CodeExample } from './request-example';

const RequestExampleDemo: React.FC = () => {
  const examples: CodeExample[] = [
    {
      label: "cURL",
      value: "bash",
      code: `curl -X GET "https://api.example.com/v3/agents" \\
  -H "Authorization: {% $api.key %}" \\
  -H "Content-Type: application/json"`
    },
    {
      label: "JavaScript",
      value: "javascript",
      code: `fetch("https://api.example.com/v3/agents", {
  method: "GET",
  headers: {
    "Authorization": "{% $api.key %}",
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data));`
    },
    {
      label: "Python",
      value: "python",
      code: `import requests

headers = {
    "Authorization": "{% $api.key %}",
    "Content-Type": "application/json"
}

response = requests.get("https://api.example.com/v3/agents", headers=headers)
data = response.json()
print(data)`
    }
  ];

  const variables = {
    'api.key': 'Bearer sk-1234567890abcdef...'
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <RequestExample
        examples={examples}
        variables={variables}
        title="API Request Examples"
        className="mb-6"
      />
    </div>
  );
};

export default RequestExampleDemo;
