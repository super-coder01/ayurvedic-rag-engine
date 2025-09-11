# Data Directory Structure

This directory contains the processed data for the RAG system:

## Files:
- `faiss_index.bin` - FAISS vector index for text chunks
- `text_chunks.txt` - Text chunks with metadata
- `recipes.json` - Ayurvedic recipes database
- `ingredients.json` - Ayurvedic ingredients database

## Usage:
These files are loaded by the vector service and cloudant service for RAG functionality.