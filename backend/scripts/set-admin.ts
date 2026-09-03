import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (getApps().length === 0) {
  initializeApp();
}

const auth = getAuth();

async function main() {
  const args = process.argv.slice(2);
  const target = args.find((arg) => !arg.startsWith("--"));
  const isRevoke = args.includes("--revoke");

  
  if (!target) {
    console.error(`
Uso:
  npm run set-admin -- <email_ou_uid> [--revoke]

Exemplos:
  npm run set-admin -- usuario@kibonoie.org.br
  npm run set-admin -- usuario@kibonoie.org.br --revoke
    `);
    process.exit(1);
  }

  try {
    const user = target.includes("@")
      ? await auth.getUserByEmail(target)
      : await auth.getUser(target);

    const currentClaims = user.customClaims || {};
    const newClaims = {
      ...currentClaims,
      admin: !isRevoke,
    };

    if (isRevoke) {
      delete newClaims.admin;
    }

    await auth.setCustomUserClaims(user.uid, newClaims);

    console.log("--------------------------------------------------");
    console.log(
      isRevoke
        ? "✅ Permissão de admin REVOGADA com sucesso para:"
        : "✅ Permissão de admin CONCEDIDA com sucesso para:"
    );
    console.log(`   E-mail: ${user.email}`);
    console.log(`   UID:    ${user.uid}`);
    console.log(`   Claims: ${JSON.stringify(newClaims)}`);
    console.log("--------------------------------------------------");
    console.log(
      "ℹ️  Atenção: Se o usuário estiver atualmente conectado no painel,"
    );
    console.log(
      "   ele precisará fazer Logout e Login novamente (ou aguardar a renovação"
    );
    console.log("   do token) para que a alteração tenha efeito.");
    console.log("--------------------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao atualizar privilégios do usuário:", error.message || error);
    process.exit(1);
  }
}

main();

