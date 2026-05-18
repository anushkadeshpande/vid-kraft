You are a senior product architect, and we want to build a video editor.
Below are the high level requirements:
1. it should be as lightweight as possible
2. Built using electron and ffmpeg 
3. Runs completely offline, no user data goes to any server
4. Very user friendly, even a new comer should be able to use it
5. UI should be aesthetic with an option to resize the video
6. The editor should support a number of operations:
  - import multiple videos/photos/audios at once
  - Resize the viewport
  - merge videos, photos
  - Add custom audio and allow merging audio
  - overlap audios
  - overlap photos, videos
  - cut video/audio
  - split audio/video
  - annotate on videos

Write reusable code which should be open to extension and closed to modification.
If any new feature is required in the future, we should be able to implement it with minimal touches to the existing codebase.
Every feature should be pushed to remote repo as soon as development is complete
Maintain a change log so that the AI agent can pick up and continue working without having to go through the codebase again and again.