# **Project Documentation: Call Analysis**

## **Table of Contents**

1. [Overview](#overview)
2. [Backend Documentation](#backend-documentation)

   1. [Setup and Installation](#setup-and-installation)
   2. [API Endpoints](#api-endpoints)

      * [POST /analyze-call/](#post-analyze-call)
   3. [Dependencies](#dependencies)
   4. [Error Handling](#error-handling)
3. [Frontend Documentation](#frontend-documentation)

   1. [Setup and Installation](#setup-and-installation-1)
   2. [Components](#components)

      * [FileUpload Component](#fileupload-component)
      * [DownloadPDF Component](#downloadpdf-component)
   3. [Error Handling](#error-handling-1)
   4. [Dependencies](#dependencies-1)
4. [Sample Call Example](#sample-call-example)

   1. [Call Example Link](#call-example-link)
   2. [Call Transcript](#call-transcript)
   3. [Call Analysis](#call-analysis)
5. [Project Flow](#project-flow)
6. [License](#license)

---

## **Overview**

This project provides a web application that allows users to upload audio files, analyze the calls, and receive a detailed transcript and analysis report. The backend is powered by FastAPI and AssemblyAI for speech-to-text transcription, while the frontend is built using React.

---

## **Backend Documentation**

### **Setup and Installation**

1. **Clone the repository**:

   ```bash
   git clone https://github.com/satvikprsd/AI_Call_Insights.git
   cd AI_Call_Insights/backend
   ```

2. **Install dependencies**:
   Ensure you have Python 3.8+ installed. Then, install the required dependencies using `pip`:

   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**:
   Create a `.env` file at the root of the project and add the following:

   ```
   ASSEMBLYAI_API=your_assemblyai_api_key
   TOGETHER_API=your_together_api_key
   ```

4. **Run the FastAPI application**:
   After setting up the environment, you can run the backend server:

   ```bash
   uvicorn main:app --reload
   ```

5. **Access the API documentation**:
   Once the server is running, you can access the Swagger API documentation by visiting:

   ```
   http://127.0.0.1:8000/docs
   ```

### **API Endpoints**

#### **`POST /analyze-call/`**

* **Description**: This endpoint accepts an audio file, transcribes it using AssemblyAI, and provides an analysis of the conversation.

* **Request Body**:

  * `audio`: A file (audio format: MP3, WAV, etc.).

* **Response**:

  * `transcript`: The transcribed text of the audio file.
  * `analysis`: An analysis of the call, including summarized points, key discussion topics, objections raised, and actionable next steps.

* **Example Request**:

  ```bash
  curl -X 'POST' \
    'http://127.0.0.1:8000/analyze-call/' \
    -H 'accept: application/json' \
    -H 'Content-Type: multipart/form-data' \
    -F 'audio=@path_to_audio_file'
  ```

* **Example Response**:

  ```json
  {
    "transcript": "The customer mentioned they are interested in upgrading their plan...",
    "analysis": "1. The customer is happy with the product. 2. No major objections were raised..."
  }
  ```

### **Dependencies**:

* **FastAPI**: Web framework for building APIs.
* **AssemblyAI**: Speech-to-text API used for transcribing audio.
* **Together**: A chat-based API used for generating insights and summaries based on the transcribed text.
* **Python-dotenv**: To manage environment variables.
* **Shutil**: For handling file operations like copying and removing files.

### **Error Handling**:

If the transcription or analysis fails, the API will return a `500 Internal Server Error` with a message describing the issue.

---

## **Frontend Documentation**

### **Setup and Installation**

1. **Clone the repository**:

   ```bash
   git clone https://github.com/satvikprsd/AI_Call_Insights.git
   cd AI_Call_Insights/frontend
   ```

2. **Install dependencies**:
   Ensure you have Node.js and npm installed. Then, install the required dependencies:

   ```bash
   npm install
   ```

3. **Run the development server**:
   After setting up the frontend, you can run the development server:

   ```bash
   npm start
   ```

4. **Access the frontend**:
   The application will be accessible at `http://localhost:5173` (vite).

### **Components**:

#### **FileUpload Component**

* **Purpose**: Allows users to upload an audio file and trigger the analysis process.

* **State**:

  * `audioFile`: Holds the selected file.
  * `isLoading`: Indicates if the file is being processed.
  * `transcript`: Holds the transcribed text from the backend.
  * `analysis`: Holds the analysis results from the backend.
  * `error`: Error message if something goes wrong.

* **Usage**:
  The user selects an audio file from their local machine, and when they click the upload button, the file is sent to the backend for processing. After processing, the transcript and analysis are displayed.

  **Code Example**:

  ```jsx
  const handleUpload = async () => {
    if (!audioFile) return;

    setIsLoading(true);
    setError('');
    setTranscript('');
    setAnalysis('');
    setTimer(60);

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/analyze-call/',
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
    }
  };
  ```

#### **DownloadPDF Component**

* **Purpose**: Allows users to download the transcript and analysis as a PDF document.

* **Logic**:
  This component uses the `jsPDF` library to generate a downloadable PDF report from the transcript and analysis content.

* **Usage**:
  When the user clicks the **Download PDF** button, the content is formatted into a PDF document and downloaded to the user's machine.

  **Code Example**:

  ```jsx
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Transcript:", 10, 10);
    doc.text(transcript, 10, 20);
    doc.text("Analysis:", 10, 30);
    doc.text(analysis, 10, 40);
    doc.save("call_report.pdf");
  };
  ```

### **Error Handling**:

If there is an error with the file upload or the API request, an error message is displayed to the user.

### **Dependencies**:

* **React**: JavaScript library for building user interfaces.
* **Axios**: HTTP client for making requests to the backend API.
* **jsPDF**: Library for generating PDFs from JavaScript.
* **FileSaver.js**: For saving files on the client-side.
* **TailwindCSS**: Utility-first CSS framework for styling the frontend.

---

## **Sample Call Example**

### **Call Example Link**

Here is the sample call you can listen to for a better understanding of the type of call our system analyzes:

* [Sample Call Example - YouTube](https://www.youtube.com/watch?v=4ostqJD3Psc)

### **Call Transcript**

```text
Thank you for calling Nissan. My name is Lauren. Can I have your name? 
Yeah, my name is John Smith. Thank you, John. How can I help you? 
I was just calling about to see how much it would cost to update the map in my car. 
I'd be happy to help you with that today. Did you receive a mailer from us? 
I did. Do you need the customer number? Yes, please. 
Okay, it's 15243. Thank you. And the year, make and model of your vehicle? 
Yeah, I have a 2009 Nissan Altima. Oh, nice car. Yeah, thank you. 
We really enjoy it. Okay, I think I found your profile here. Can I have you verify your address and phone number, please? 
Yes, it's 1255 North Research Way. That's in Orem, Utah, 84097. 
And my phone number is 801-4311. Thanks, John. I located your information. 
The newest version we have available for your vehicle is version 7.7, which was released in March of 2012. 
The price of the new map is $99, plus shipping and tax. Let me go ahead and set up this order for you. 
Well, can we wait just a second? I'm not really sure if I can afford it right now. 
All right, well, here are a few reasons to consider purchasing today. 
It looks as though you haven't updated your vehicle for three years, so that would be the equivalent of getting three years worth of updates for the price of one. 
Oh, okay. In addition, special offers like the current promotion don't come around too often. 
I would definitely recommend taking advantage of the extra $50 off before it expires. 
Yeah, that does sound pretty good. If I set this order up for you now, it'll ship out today and for $
```


```

### **Call Analysis**

**Call Summary and Analysis**
### 1. Call Summary in 5 Bullet Points
* The customer, John Smith, called Nissan to inquire about updating the map in his 2009 Nissan
Altima.
* The sales agent, Lauren, located John's profile and informed him that the newest version
available is 7.7, released in March 2012, priced at $99 plus shipping and tax.
* John expressed hesitation about the cost, prompting Lauren to highlight the benefits of
purchasing the update, including three years' worth of updates for the price of one and a special
promotion offering $50 off.
* Lauren encouraged John to take advantage of the promotion, which was about to expire, and
offered to set up the order for immediate shipping at the discounted price.
* John agreed to proceed with the purchase using his Visa card.
### 2. Key Discussion Topics
- Map update for 2009 Nissan Altima
- Cost and pricing
- Benefits of purchasing the update
- Special promotion and discount
- Payment and order setup
### 3. Objections Raised by the Customer
- Financial concerns: John was unsure if he could afford the update at the time of the call.
### 4. Sales Agent Rating
- **Tone and Empathy: 4/5** - Lauren maintained a professional and friendly tone throughout the
call. She showed empathy by understanding John's financial concerns and addressing them with
relevant information.
- **Flow and Clarity: 5/5** - The conversation flowed smoothly, with Lauren clearly explaining the
process, benefits, and details of the map update.
- **Objection Handling: 4/5** - Lauren effectively handled John's financial objection by
highlighting the value of the update and the limited-time promotion. However, she could have
further explored John's concerns or offered alternative solutions.
### 5. Next Actionables
- **Process the payment and complete the order**: Lauren should finalize the transaction with
John's Visa card details to ensure the order is shipped out as promised.
- **Confirm the order details with John**: A follow-up confirmation of the order, including the map
version, price, shipping, and tax, should be sent to John to ensure transparency and customer
satisfaction.
- **Follow up on customer satisfaction**: After the order has been shipped and received, Nissan
should follow up with John to ensure he is satisfied with the map update and to gather any
feedback for future improvements.
- **Review and potentially adjust sales strategies**: Nissan could review this sales call, among
others, to identify common objections and assess the effectiveness of their current promotions
and pricing strategies, making adjustments as necessary to improve sales outcomes.
```
---

## **Project Flow**
The project follows a clean and simple flow where:
1. The user uploads an audio file.
2. The backend transcribes the audio and performs an analysis.
3. The frontend displays the transcript and analysis to the user.
4. The user can download the transcript and analysis as a PDF.

---
