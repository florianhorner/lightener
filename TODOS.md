# TODOs

## Deduplicate CI validation workflows
`hassfest.yml` and `hacs.yml` run the same checks as `validate.yml`. Consider removing the standalone files and keeping only `validate.yml` to avoid confusion about which workflow is authoritative.
