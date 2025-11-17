# Base image
FROM python:3.11-slim

# Install Poppler for pdf2image
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
&& rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy requirements (buat requirements.txt dulu)
COPY requirements.txt .

# Install dependencies
RUN pip install torch==2.4.0+cpu torchvision==0.19.0+cpu torchaudio==2.4.0+cpu --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Run FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
