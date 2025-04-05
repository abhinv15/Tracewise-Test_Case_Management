from flask import Flask, request, jsonify
import json
from openai import OpenAI
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the API key securely
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Setup OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_traceability_analysis(requirements, newRequirements, testcases):
    system_prompt = """
You are an AI Test Case Management Assistant. Your job is to analyze changes between old and new software requirements,
compare them against the existing test cases, and categorize them as:
 New (missing),
 Updated (requirement changed),
 Obsolete (requirement removed or drastically changed).

Return a structured JSON object with test case suggestions and the reasoning.
"""

    user_prompt = f"""
Old Requirements:
{json.dumps(requirements, indent=2)}

New Requirements:
{json.dumps(newRequirements, indent=2)}

Test Cases:
{json.dumps(testcases, indent=2)}

Please analyze the differences and output suggestions in this format:

{{
  "new_test_cases": [
    {{ "suggested_title": "...", "linked_requirement": "...", "reason": "..." }}
  ],
  "updated_test_cases": [
    {{ "test_case_id": "...", "reason": "..." }}
  ],
  "obsolete_test_cases": [
    {{ "test_case_id": "...", "reason": "..." }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3
    )

    output = response.choices[0].message.content
    return json.loads(output)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Load JSON files for 'requirements', 'newRequirements', and 'testcases'
        with open('requirements.json', 'r') as f:
            requirements = json.load(f)

        with open('newrequirements.json', 'r') as f:
            newRequirements = json.load(f)

        with open('testcases.json', 'r') as f:
            testcases = json.load(f)

        # Ensure the files have been loaded
        if not requirements or not newRequirements or not testcases:
            return jsonify({"status": "error", "message": "Missing or invalid data in JSON files."}), 400

        # Run traceability analysis
        results = generate_traceability_analysis(requirements, newRequirements, testcases)

        return jsonify({"status": "success", "results": results}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/update-new-requirements', methods=['POST'])
def update_new_requirements():
    try:
        # Get the updated requirements from the request
        updated_requirements = request.get_json()

        # Write the updated requirements to newRequirements.json in the same directory as server.py
        with open('./newRequirements.json', 'w') as f:
            json.dump(updated_requirements, f, indent=4)

        return jsonify({"status": "success", "message": "newRequirements.json updated successfully"})
    except Exception as e:
        print("Error:", str(e))  # Debug log
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/update-testcases', methods=['POST'])
def update_testcases():
    try:
        # Get the updated test cases from the request
        updated_testcases = request.get_json()

        # Write the updated test cases to testcases.json
        with open('./testcases.json', 'w') as f:
            json.dump(updated_testcases, f, indent=4)

        return jsonify({"status": "success", "message": "testcases.json updated successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
