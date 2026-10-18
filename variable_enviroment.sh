#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${1:-"$SCRIPT_DIR/.env"}"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Arquivo .env não encontrado em: $ENV_FILE" >&2
    exit 1
fi

echo "🚀 Lendo variáveis de: $ENV_FILE"
echo "🔧 Recriando arquivos .env.keys para cada projeto..."
echo ""

declare -A INITIALIZED_PROJECTS
declare -A KEY_COUNTS

while IFS= read -r line || [ -n "$line" ]; do
    line="${line//$'\r'/}"

    [[ -z "${line// /}" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue

    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        KEY="${BASH_REMATCH[1]}"
        VALUE="${BASH_REMATCH[2]}"

        KEY="${KEY#"${KEY%%[![:space:]]*}"}"
        KEY="${KEY%"${KEY##*[![:space:]]}"}"
        VALUE="${VALUE#"${VALUE%%[![:space:]]*}"}"
        VALUE="${VALUE%"${VALUE##*[![:space:]]}"}"

        if [[ "$VALUE" =~ ^\"(.*)\"$ ]]; then
            VALUE="${BASH_REMATCH[1]}"
        elif [[ "$VALUE" =~ ^\'(.*)\'$ ]]; then
            VALUE="${BASH_REMATCH[1]}"
        fi

        if [[ "$KEY" =~ ^([A-Za-z0-9_-]+)_(DOTENV_PRIVATE_KEY(_[A-Za-z0-9_-]+)?)$ ]]; then
            PROJECT="${BASH_REMATCH[1],,}"
            KEY_NAME="${BASH_REMATCH[2]}"

            PROJECT_DIR="$SCRIPT_DIR/$PROJECT"
            TARGET_FILE="$PROJECT_DIR/.env.keys"

            if [ ! -d "$PROJECT_DIR" ]; then
                mkdir -p "$PROJECT_DIR"
            fi

            if [[ -z "${INITIALIZED_PROJECTS[$PROJECT]:-}" ]]; then
                : > "$TARGET_FILE"
                INITIALIZED_PROJECTS["$PROJECT"]=1
                KEY_COUNTS["$PROJECT"]=0
            fi

            echo "$KEY_NAME=$VALUE" >> "$TARGET_FILE"
            KEY_COUNTS["$PROJECT"]=$(( ${KEY_COUNTS["$PROJECT"]} + 1 ))
        fi
    fi
done < "$ENV_FILE"

if [ ${#INITIALIZED_PROJECTS[@]} -eq 0 ]; then
    echo "⚠️  Nenhuma chave de dotenvx encontrada no arquivo .env."
    exit 0
fi

echo "✅ Arquivos .env.keys recriados com sucesso:"
for proj in "${!INITIALIZED_PROJECTS[@]}"; do
    echo "   - $proj/.env.keys (${KEY_COUNTS[$proj]} chave(s))"
done
