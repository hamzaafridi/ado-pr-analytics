# Configuration Example

## Azure DevOps Setup

To use this application, you'll need:

1. **Organization Name**: Your Azure DevOps organization (e.g., `mycompany`)
2. **Project Name**: The specific project within your organization (e.g., `myproject`)
3. **Personal Access Token**: A PAT with Code (read) permissions

## Creating a Personal Access Token

1. Go to [Azure DevOps User Settings](https://dev.azure.com/{your-org}/_usersSettings/tokens)
2. Click "New Token"
3. Configure the token:
   - **Name**: "PR Analytics App"
   - **Expiration**: Choose appropriate duration
   - **Scopes**: Select "Code (read)"
4. Copy the generated token

## Example Values

```
Organization: mycompany
Project: myproject  
PAT: abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## Security Notes

- Never share your PAT with others
- Store it securely
- This app stores credentials in memory only (not persisted)
- Consider using environment variables for production deployments
