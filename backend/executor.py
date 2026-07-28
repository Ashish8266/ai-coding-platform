import subprocess
import tempfile
import os

TIMEOUT_SECONDS = 5

def run_python(code):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        filepath = f.name
    try:
        result = subprocess.run(
            ['python3', filepath],
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS
        )
        return {"output": result.stdout, "stderr": result.stderr}
    except subprocess.TimeoutExpired:
        return {"output": "", "stderr": "Execution timed out (5 second limit)."}
    finally:
        os.unlink(filepath)

def run_java(code):
    tmpdir = tempfile.mkdtemp()
    filepath = os.path.join(tmpdir, "Main.java")
    with open(filepath, 'w') as f:
        f.write(code)
    try:
        compile_result = subprocess.run(
            ['javac', filepath],
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
            cwd=tmpdir
        )
        if compile_result.returncode != 0:
            return {"output": "", "stderr": compile_result.stderr}

        run_result = subprocess.run(
            ['java', '-cp', tmpdir, 'Main'],
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS
        )
        return {"output": run_result.stdout, "stderr": run_result.stderr}
    except subprocess.TimeoutExpired:
        return {"output": "", "stderr": "Execution timed out (5 second limit)."}