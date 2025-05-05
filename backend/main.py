from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import whisper
import os
import shutil
from together import Together

load_dotenv()

app = FastAPI()

whisper_model = whisper.load_model("medium")
client = Together()

@app.post("/analyze-call/")
async def analyze_call(audio: UploadFile = File(...)):
    try:
        temp_path = f"temp/temp_{audio.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        print(temp_path)
        transcript = whisper_model.transcribe(temp_path)
        print(transcript['text'])

        prompt = f"""
        You are a Sales QA Analyst. A transcript of a sales call is provided below.

        Transcript:
        \"\"\"{transcript['text']}\"\"\"

        1. Fix any typo in the transcript.
        2. Summarize the call in 5 bullet points.
        3. List the key discussion topics.
        4. Identify objections raised by the customer.
        5. Rate the sales agent on:
        - Tone and empathy
        - Flow and clarity
        - Objection handling
        (Use a 5-star rating scale)
        6. List next actionables with brief reasoning.

        Respond in a well-structured format.
        """

        response = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            messages=[{"role": "user", "content": prompt}]
        )

        os.remove(temp_path)

        return JSONResponse(content={"analysis": response.choices[0].message.content})

    except Exception as e:
        print(e)
        return JSONResponse(status_code=500, content={"error": str(e)})
