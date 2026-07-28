import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-flash-latest"

def get_hint(question_title, question_description, user_code):
    prompt = f"""You are a coding interview mentor. A student is working on this problem:

Title: {question_title}
Description: {question_description}

Their current code:
{user_code}

Give ONE short, helpful hint that nudges them toward the right approach.
Do NOT give the full solution or working code. Keep it to 2-3 sentences."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text

def get_review(question_title, user_code):
    prompt = f"""You are a code reviewer. Review this solution to "{question_title}":

{user_code}

Give brief, constructive feedback in 3-4 sentences covering:
- Code readability
- Any edge cases that might be missed
- One suggestion for improvement
Do not just say it's correct/incorrect — focus on quality feedback."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text

def get_explanation(question_title, user_code, user_question):
    prompt = f"""A student solved "{question_title}" with this code:

{user_code}

They're asking: "{user_question}"

Answer their question clearly and concisely, referencing their actual code."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text