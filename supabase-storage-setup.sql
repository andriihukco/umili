-- Supabase Storage Setup for Chat Files
-- Run this SQL in your Supabase SQL Editor

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload chat files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to view chat files
CREATE POLICY "Authenticated users can view chat files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated'
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete their own chat files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated'
);

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Create policy to allow anyone to view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Create policy to allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Create policy to allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Create storage bucket for portfolio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload portfolio files
CREATE POLICY "Authenticated users can upload portfolio files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio' AND
  auth.role() = 'authenticated'
);

-- Create policy to allow anyone to view portfolio files
CREATE POLICY "Anyone can view portfolio files" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio');

-- Create policy to allow users to update their own portfolio files
CREATE POLICY "Users can update their own portfolio files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio' AND
  auth.role() = 'authenticated'
);

-- Create policy to allow users to delete their own portfolio files
CREATE POLICY "Users can delete their own portfolio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio' AND
  auth.role() = 'authenticated'
);
