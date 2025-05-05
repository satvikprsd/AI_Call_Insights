from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from together import Together

load_dotenv()

app = FastAPI()
client = Together()

# Define the input schema
class TranscriptInput(BaseModel):
    transcript: str

@app.post("/analyze-transcript/")
async def analyze_transcript(data: TranscriptInput):
    try:
        prompt = f"""
        You are a Sales QA Analyst. A transcript of a sales call is provided below.

        Transcript:
        \"\"\"{data.transcript}\"\"\"

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

        return JSONResponse(content={"analysis": response.choices[0].message.content})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
