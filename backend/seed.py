from database import SessionLocal
from models import Question

db = SessionLocal()

questions = [
    Question(
        title="Two Sum",
        description="Given an array of integers and a target, return the indices of the two numbers that add up to the target.",
        difficulty="Easy",
        sample_input="nums = [2,7,11,15], target = 9",
        sample_output="[0,1]"
    ),
    Question(
        title="Reverse String",
        description="Write a function that reverses a string in place.",
        difficulty="Easy",
        sample_input='s = ["h","e","l","l","o"]',
        sample_output='["o","l","l","e","h"]'
    ),
    Question(
        title="Valid Parentheses",
        description="Given a string containing just the characters ( ) { } [ ], determine if the input string is valid.",
        difficulty="Easy",
        sample_input='s = "()[]{}"',
        sample_output="true"
    ),
]

db.add_all(questions)
db.commit()
db.close()

print("Seeded 3 questions successfully.")