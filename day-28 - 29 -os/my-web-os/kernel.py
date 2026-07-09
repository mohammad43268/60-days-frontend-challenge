import os
import uvicorn
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

app = FastAPI()

# Clean, single instance of CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

class CommandRequest(BaseModel):
    prompt: str

# Tool definitions for the OS to control the frontend
tools_config = [
    {
        "function_declarations": [
            {
                "name": "open_app", 
                "description": "Open an application.", 
                "parameters": {"type": "OBJECT", "properties": {"appId": {"type": "STRING"}, "title": {"type": "STRING"}}, "required": ["appId", "title"]}
            },
            {
                "name": "change_wallpaper", 
                "description": "Changes the desktop wallpaper."
            },
            {
                "name": "write_code_to_editor", 
                "description": "Writes code into the code editor.", 
                "parameters": {"type": "OBJECT", "properties": {"code": {"type": "STRING"}}, "required": ["code"]}
            }
        ]
    }
]

@app.post("/api/command")
def process_command(req: CommandRequest):
    try:
        # ADVANCED: Dynamic System Clock
        now = datetime.now().strftime("%I:%M %p, %A, %B %d, %Y")
        system_persona = f"You are the kernel of Aura OS, an advanced Agentic operating system. Current system time: {now}. Location: Gurugram, India. Execute tasks efficiently."
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=req.prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_persona, # Injects the OS identity
                tools=tools_config
            )
        )
        
        # Check if the AI decided to execute a system tool
        if response.function_calls:   
            fc = response.function_calls[0]
            return {
                "type": "action",
                "commands": [{"action": fc.name, "args": fc.args}],
                "message": "Executing OS command..."
            }
            
        # Return standard conversational response if no tools were called
        return {"type": "text", "message": response.text}
    
    except Exception as e:
        return {"type": "error", "message": f"Kernel Panic: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)