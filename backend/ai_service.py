import google.generativeai as genai
import os
from dotenv import load_dotenv

class AIService:
    def __init__(self):
        self.enabled = False
        self.model = None
        self._configure()

    def _configure(self):
        load_dotenv(override=True)
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            self.enabled = False
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.enabled = True

    async def get_initial_insights(self, context: str) -> str:
        if not self.enabled:
            return "AI Insights are unavailable. Please configure your GEMINI_API_KEY."
        
        prompt = f"""
        You are a senior data analyst. Based on the following dataset summary, provide exactly 3-4 key high-level insights. 
        Focus on:
        1. Trend Detection (increase/decrease over time)
        2. Peak / Drop Analysis (highest/lowest points)
        3. Category Insights (dominant categories)
        4. Outliers or Anomalies

        Format each insight as a single-line bullet point start with '- '. 
        Keep each insight under 2 lines of text. Use professional, human-readable language.

        {context}
        """
        try:
            print(f"Generating insights with Gemini for context length: {len(context)}")
            response = await self.model.generate_content_async(prompt)
            if response and response.text:
                print("Gemini insights successfully generated.")
                return response.text
            print("Gemini returned empty response.")
            return "No insights generated. Please try again."
        except Exception as e:
            print(f"Gemini API Error: {str(e)}")
            return f"Error generating insights: {str(e)}"

    async def chat_with_data(self, context: str, user_query: str, history: list = None) -> str:
        if not self.enabled:
            return "Chat is unavailable. Please configure your GEMINI_API_KEY."
        
        prompt = f"""
        You are a conversational data assistant and an expert data analyst. Use the following dataset context to answer user questions.
        When providing insights, be highly detailed, comprehensive, and analytical. Break down your findings clearly, highlighting trends, anomalies, and actionable takeaways.
        If you don't know the answer based on the context, say so.
        
        Dataset Context:
        {context}
        
        User Question: {user_query}
        """
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            return f"Error in chat: {str(e)}"

