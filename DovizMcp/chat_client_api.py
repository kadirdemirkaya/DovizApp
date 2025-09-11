from flask import Flask, request, jsonify
import asyncio
import nest_asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import requests
import os
import re
import nest_asyncio
import json
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

env_path = Path(__file__).parent.parent / ".env" 
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

server_params = StdioServerParameters(command="python", args=["chat_server_api.py"])

nest_asyncio.apply()

def llm_client2(prompt: str):
    """Call Gemini API."""
    try:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {"Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        resp = requests.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"[Gemini API Error] {str(e)}"

def llm_client(message: str):
    """Call OpenRouter API."""
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "BMI Tool Client"
        }
        payload = {
            "model": "google/gemini-2.0-flash-exp:free",
            "messages": [
                {"role": "system", "content": "You are an intelligent assistant. Execute tasks as prompted."},
                {"role": "user", "content": message}
            ],
            "temperature": 0.2,
            "max_tokens": 250
        }
        resp = requests.post(url, headers=headers, data=json.dumps(payload))
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"[OpenRouter API Error] {str(e)}"

def get_prompt_to_identify_tool_and_arguments(query, tools):
    """Generate prompt for selecting the right tool."""
    tools_description = "\n".join([f"- {tool.name}: {tool.description}" for tool in tools])
    return (
        f"You have access to these tools:\n{tools_description}\n"
        f"User's question: {query}\n"
        "Choose the right tool and provide arguments in JSON:\n"
        "{\n"
        '    "tool": "tool-name",\n'
        '    "arguments": {"argument-name": "value"}\n'
        "}\n"
    )

async def run_mcp(query: str):
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()

            prompt = get_prompt_to_identify_tool_and_arguments(query, tools.tools)
            llm_response = llm_client(prompt)

            # Clean Markdown fences
            llm_response = re.sub(r"^```[a-zA-Z]*\n?", "", llm_response.strip())
            llm_response = re.sub(r"\n?```$", "", llm_response)

            try:
                tool_call = json.loads(llm_response)
            except json.JSONDecodeError:
                return {"error": f"Invalid JSON from LLM: {llm_response}"}

            result = await session.call_tool(tool_call["tool"], arguments=tool_call["arguments"])
            tool_output = result.content[0].text if result.content else ""

            commentary_prompt = f"The e tool returned the following data:\n{tool_output}\nAs a user-friendly currency interpreter, it can explain in a way that the user will understand. Avoid unnecessary information and use the data at hand to provide a user-friendly answer."
            commentary = llm_client2(commentary_prompt)

            return {
                "tool": tool_call.get("tool"),
                "arguments": tool_call.get("arguments"),
                "tool_output": tool_output,
                "commentary": commentary
            }

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(force=True)
        query = data.get("query") or data.get("prompt", "")
        if not query:
            return jsonify({"error": "query is required"}), 400

        result = asyncio.get_event_loop().run_until_complete(run_mcp(query))
        print("RESULT : ",result)
        return jsonify({
            "reply": result.get("tool_output", ""),  
            **result 
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)