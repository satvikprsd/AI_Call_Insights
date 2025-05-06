from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import assemblyai as aai
import os
import shutil
from together import Together

load_dotenv()

aai.settings.api_key = os.getenv("ASSEMBLYAI_API")
app = FastAPI()

config = aai.TranscriptionConfig(speech_model=aai.SpeechModel.best)
client = Together()

@app.post("/analyze-call/")
async def analyze_call(audio: UploadFile = File(...)):
    try:
        os.makedirs("temp", exist_ok=True)
        temp_path = f"temp/temp_{audio.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        transcript = aai.Transcriber(config=config).transcribe(temp_path)

        if transcript.status == "error":
            raise RuntimeError(f"Transcription failed: {transcript.error}")

        print(transcript.text)

        prompt = f"""
        You are a Sales QA Analyst. A transcript of a sales call is provided below.

        Transcript:
        \"\"\"{transcript.text}\"\"\"

        1. Summarize the call in 5 bullet points.
        2. List the key discussion topics.
        3. Identify objections raised by the customer.
        4. Rate the sales agent on:
        - Tone and empathy
        - Flow and clarity
        - Objection handling
        (Use a 5-star rating scale)
        5. List next actionables with brief reasoning.

        Respond in a well-structured format.
        """

        response = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            messages=[{"role": "user", "content": prompt}]
        )

        os.remove(temp_path)

        return JSONResponse(content={"transcript": transcript.text ,"analysis": response.choices[0].message.content})

    except Exception as e:
        print(e)
        return JSONResponse(status_code=500, content={"error": str(e)})