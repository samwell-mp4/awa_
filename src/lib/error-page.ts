import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function renderErrorPage() {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro - AWÃ TECH</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #08100c;
            color: #f5f5f0;
            font-family: system-ui, -apple-system, sans-serif;
            text-align: center;
        }
        .container {
            max-width: 400px;
            padding: 2rem;
        }
        h1 { color: #d4af37; margin-bottom: 1rem; }
        p { color: rgba(245, 245, 240, 0.8); line-height: 1.6; }
        a {
            display: inline-block;
            margin-top: 2rem;
            padding: 0.75rem 1.5rem;
            background-color: #d4af37;
            color: #08100c;
            text-decoration: none;
            border-radius: 9999px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Erro ao carregar página</h1>
        <p>Ocorreu um problema inesperado. Por favor, tente recarregar a página ou voltar para o início.</p>
        <a href="/">Voltar para o início</a>
    </div>
</body>
</html>
  `.trim();
}
