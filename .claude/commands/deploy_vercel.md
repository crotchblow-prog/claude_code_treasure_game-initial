Deploy the current project to Vercel and return the production URL.

Follow these steps exactly:

1. Check if Vercel CLI is installed:
   ```
   vercel --version
   ```
   If the command fails, install it first:
   ```
   npm install -g vercel
   ```

2. Build the project to confirm it compiles without errors:
   ```
   npm run build
   ```
   Stop and report the error if the build fails.

3. Deploy to Vercel production:
   ```
   vercel --prod --yes
   ```
   The `--yes` flag accepts default prompts automatically.

4. From the command output, extract and display the production URL — it will look like:
   `https://<project-name>.vercel.app`

5. Report the URL clearly to the user so they can open the deployed project.

If `vercel login` is required, prompt the user to run it manually first, then re-run this command.
