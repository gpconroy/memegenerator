# Version Management Guide

## Overview

This project uses Git tags for version management, integrated with the audit system. Versions are automatically tagged after successful audits.

## Version Format

Versions follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., v1.0.0)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Viewing Versions

### List All Tags
```bash
git tag -l
```

### View Tag Details
```bash
git show v1.0.0
```

### View Commit History
```bash
git log --oneline --graph --all
```

### Compare Versions
```bash
# See what changed between versions
git diff v1.0.0 v1.1.0

# See files changed
git diff --name-only v1.0.0 v1.1.0

# See commits between versions
git log v1.0.0..v1.1.0
```

## Creating Version Tags

### Automatic Tagging (Recommended)

Version tags are **automatically created** when all audits pass:

```bash
npm run audit:all
```

If all audits pass, a version tag is automatically created with:
- Version number (incremented from latest tag)
- Git commit hash
- Branch name
- Audit results summary
- Timestamp

### Manual Tagging

You can also create tags manually:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm run version:tag:patch

# Minor version (1.0.0 -> 1.1.0)
npm run version:tag:minor

# Major version (1.0.0 -> 2.0.0)
npm run version:tag:major

# Custom version type with message
node scripts/version-tag.js patch "Custom release message"
```

### Traditional Git Tagging

```bash
# Lightweight tag
git tag v1.0.0

# Annotated tag with message
git tag -a v1.0.0 -m "Version 1.0.0 - Initial release"

# View tag
git show v1.0.0

# Push tag to remote
git push origin v1.0.0
```

## Version Workflow

### Recommended Workflow

1. **Make Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

2. **Run Audits**
   ```bash
   npm run audit:all
   ```

3. **If Audits Pass**
   - Version tag is automatically created
   - Package.json version is updated
   - Tag includes audit results

4. **If Audits Fail**
   - Fix issues
   - Re-run audits
   - Tag will be created on success

5. **Push Tags**
   ```bash
   git push origin --tags
   ```

### Version Tag Contents

Each version tag includes:
- Version number
- Git commit hash
- Branch name
- Commit date
- Audit results (quality, security, performance, coverage)
- Release message

## Version History

### View All Versions with Details

```bash
# List all tags with commit messages
git tag -l -n9

# Show all tags with dates
git log --tags --simplify-by-decoration --pretty="format:%ai %d" | head -20
```

### Find Version for Specific Commit

```bash
# See which version a commit belongs to
git describe --tags <commit-hash>

# See version for current commit
git describe --tags
```

## Integration with Audit System

### Automatic Version Tagging

The audit system automatically:
1. Runs all audits
2. Checks if all pass
3. Creates version tag if successful
4. Updates package.json version
5. Includes audit results in tag message

### Manual Version Tagging with Audit Results

```bash
# Run audits and get summary path
npm run audit:all

# Create tag with audit results
node scripts/version-tag.js patch "Release message" audit-results/full-audit-summary-*.json
```

## Best Practices

1. **Always run audits before tagging**
   ```bash
   npm run audit:all
   ```

2. **Use semantic versioning**
   - Patch: Bug fixes
   - Minor: New features
   - Major: Breaking changes

3. **Include meaningful messages**
   ```bash
   git tag -a v1.1.0 -m "v1.1.0 - Added new feature X, fixed bug Y"
   ```

4. **Push tags to remote**
   ```bash
   git push origin --tags
   ```

5. **Document breaking changes**
   - Include in tag message
   - Update CHANGELOG.md if maintained

## Version Tag Examples

```bash
# View current version
git describe --tags

# See all versions
git tag -l

# Compare two versions
git diff v1.0.0 v1.1.0

# See commits in a version
git log v1.0.0..v1.1.0 --oneline

# Checkout specific version
git checkout v1.0.0
```

## Troubleshooting

### Tag Already Exists
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
```

### View Tagged Files
```bash
git ls-tree -r v1.0.0 --name-only
```

### Find Latest Tag
```bash
git describe --tags --abbrev=0
```

## CI/CD Integration

For automated versioning in CI/CD:

```yaml
# Example GitHub Actions
- name: Run Audits
  run: npm run audit:all

- name: Create Version Tag
  if: success()
  run: npm run version:tag:patch

- name: Push Tags
  run: git push origin --tags
```
