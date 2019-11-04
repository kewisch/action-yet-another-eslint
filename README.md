action-yet-another-eslint
=========================

The GitHub actions that do ESLint annotations out there were not to my liking or didn't work
reliably, so I had to write my own. I wanted it to work with any version of ESLint that is installed
by the project and not this repo.

Usage:

```yaml
jobs:
  lint:
    name: "Lint"
    runs-on: ubuntu-latest
    steps:
      - name: "Checkout"
        uses: actions/checkout@v1

      - name: "npm ci"
        run: npm ci

      - name: "Eslint"
        uses: kewisch/action-yet-another-eslint@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          extensions: "js,jsm"

```

You can also leave out the extensions parameter and it will default to `.js`.
