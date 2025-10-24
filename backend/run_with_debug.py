#!/usr/bin/env python3
"""
Run Django server with enhanced debugging
"""

import os
import sys
import django
import logging
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('django_debug.log')
    ]
)

# Enable Django logging
logger = logging.getLogger('django')
logger.setLevel(logging.DEBUG)

if __name__ == "__main__":
    from django.core.management import execute_from_command_line
    
    print("Starting Django server with enhanced debugging...")
    print("Logs will be saved to django_debug.log")
    print("Press Ctrl+C to stop")
    
    # Run server with debug settings
    execute_from_command_line([
        'manage.py', 
        'runserver', 
        '0.0.0.0:8001',
        '--verbosity=2',
        '--traceback'
    ])
