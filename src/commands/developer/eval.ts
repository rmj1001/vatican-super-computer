import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from "discord.js";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

let slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Evaluate string as typescript code")
        .addStringOption((code) =>
            code.setName("code").setDescription("The code to evaluate"),
        ),
    flags: {
        developerOnly: true,
    },
    help: {
        name: "eval",
        category: "devtools",
        description: "Evaluate raw text as TS code.",
        usage: "eval",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        let code = interaction.options.getString("code");

        if (!code) {
            await interaction.reply(`You need to input code!`);
            return;
        }

        // This function cleans up and prepares the
        // result of our eval command input for sending
        // to the channel
        const clean = async (text: string) => {
            // If our input is a promise, await it before continuing
            if (text && text.constructor.name == "Promise") text = await text;

            // If the response isn't a string, `util.inspect()`
            // is used to 'stringify' the code in a safe way that
            // won't error out on objects with circular references
            // (like Collections, for example)
            if (typeof text !== "string")
                text = require("util").inspect(text, { depth: 1 });

            // Replace symbols with character code alternatives
            text = text
                .replace(/`/g, "`" + String.fromCharCode(8203))
                .replace(/@/g, "@" + String.fromCharCode(8203));

            // Send off the cleaned up result
            return text;
        };

        const evalEmbed = new EmbedBuilder()
            .setThumbnail(
                "https://www.clipartmax.com/png/small/2-28484_tools-clipart.png",
            )
            .setTimestamp();

        // In case something fails, we to catch errors
        // in a try/catch block
        try {
            // Evaluate (execute) our input
            const evaled = eval(code);

            // Put our eval result through the function
            // we defined above
            const cleaned = await clean(evaled);

            // Edit embed
            evalEmbed.setTitle("Eval Command");
            evalEmbed.setColor(0x12e3ff);
            evalEmbed.addFields(
                { name: "Input Command", value: `\`\`\`\n${code}\n\`\`\`` },
                { name: "Output", value: `\`\`\`md\n${cleaned}\n\`\`\`` },
            );

            // Reply in the channel with our result
            await interaction.reply({ embeds: [evalEmbed] });
        } catch (err) {
            // Reply in the channel with our error
            // evalEmbed.setDescription(`\`\`\`md\n${clean(err)}\n\`\`\``);
            evalEmbed.setTitle("Eval Command Error");
            evalEmbed.setColor(0xff0037);
            evalEmbed.addFields(
                { name: "Input Command", value: `\`\`\`\n${code}\n\`\`\`` },
                { name: "Error", value: `\`\`\`md\n${err}\n\`\`\`` },
            );

            await interaction.reply({ embeds: [evalEmbed] });
        }
    },
};

module.exports = slashCommand;
