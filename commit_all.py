import subprocess
import os

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command '{command}': {e.stderr}")
        return None

def main():
    # Get status in porcelain format for easy parsing
    status_output = run_command("git status --porcelain")
    
    if not status_output:
        print("No changes found.")
        return

    lines = status_output.split('\n')
    
    for line in lines:
        if not line.strip():
            continue
            
        # Porcelain format: XY Path
        # X = status of index, Y = status of work tree
        status_code = line[:2]
        file_path = line[3:].strip()
        
        # Handle filenames with spaces (if they are quoted in porcelain)
        if file_path.startswith('"') and file_path.endswith('"'):
            file_path = file_path[1:-1]
        
        filename = os.path.basename(file_path)
        action = "Update"
        
        if status_code.startswith("??"):
            action = "Add"
        elif "D" in status_code:
            action = "Delete"
        elif "M" in status_code:
            action = "Update"
        elif "A" in status_code:
            action = "Create"
            
        # Construct simplified 2-word message: Action Filename
        # We'll just take the action and the filename.
        message = f"{action} {filename}"
        
        print(f"Committing {file_path} with message: '{message}'")
        
        # Add the file
        add_cmd = f'git add "{file_path}"'
        run_command(add_cmd)
        
        # Commit the file
        commit_cmd = f'git commit -m "{message}"'
        run_command(commit_cmd)

if __name__ == "__main__":
    main()
