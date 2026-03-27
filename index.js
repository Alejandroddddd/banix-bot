const { KeepAlive } = require("./keep_alive")

let users = {};

if (fs.existsSync("data.json")) {
  users = JSON.parse(fs.readFileSync("data.json"));
}

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const shadowMuted = new Set();

client.once("ready", () => {
  console.log("Banix está encendido 🔥");
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // 👻 SHADOW ACTIVO (NO TOCAR)
if (shadowMuted.has(message.author.id)) {
  await message.delete().catch(() => {});
  return;
}

  const miembro = message.member;
  const tienePermiso = miembro.roles.cache.some(
    role => role.name === "BanixCommands"
  );

  const args = message.content.split(" ");
  const comando = args[0];
  const usuario = message.mentions.users.first();

  // 📊 INICIALIZAR
  if (!users[message.author.id]) {
    users[message.author.id] = { puntos: 100, warnings: 0 };
  }

  // 📊 PUNTOS (LIBRE)
  if (comando === "!puntos") {
    if (!usuario) return message.reply("Menciona a alguien 👀");

    if (!users[usuario.id]) {
      users[usuario.id] = { puntos: 100, warnings: 0 };
    }

    const data = users[usuario.id];

    return message.reply(
      `📊 ${usuario.username}\n🟢 ${data.puntos} puntos\n⚠️ ${data.warnings} warnings`
    );
  }

  // ⚠️ ADVERTIR (PROTEGIDO)
  if (comando === "!advertir") {

    if (!tienePermiso) {
      return message.reply("❌ No tienes permiso");
    }

    if (!usuario) return message.reply("Menciona a alguien 👀");

    if (!users[usuario.id]) {
      users[usuario.id] = { puntos: 100, warnings: 0 };
    }

    users[usuario.id].warnings++;
    users[usuario.id].puntos -= 10;

    fs.writeFileSync("data.json", JSON.stringify(users, null, 2));

    const warns = users[usuario.id].warnings;

    message.channel.send(
      `🚨 ${usuario.username}\n⚠️ ${warns} warnings\n💔 ${users[usuario.id].puntos} puntos`
    );

    if (warns == 2) {
      shadowMuted.add(usuario.id);
      message.channel.send("👻 Shadow automático");
    }

    if (warns == 3) {
      const m = message.guild.members.cache.get(usuario.id);
      if (m) await m.kick();
    }
  }

  // 👻 SHADOW
  if (comando === "!shadow") {

    if (!tienePermiso) {
      return message.reply("❌ No tienes permiso");
    }

    if (!usuario) return message.reply("Menciona a alguien 👀");

    shadowMuted.add(usuario.id);

    return message.reply("👻 Usuario silenciado");
  }

  // 🔄 RESET
  if (comando === "!reset") {

    if (!tienePermiso) {
      return message.reply("❌ No tienes permiso");
    }

    if (!usuario) return message.reply("Menciona a alguien 👀");

    users[usuario.id] = { puntos: 100, warnings: 0 };
fs.writeFileSync("data.json", JSON.stringify(users, null, 2));
    shadowMuted.delete(usuario.id);

    return message.reply("🔄 Usuario reiniciado");
  }

});

client.login(process.env.TOKEN);