import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    codeBlock,
} from "discord.js";
import bot from "@src/index";
import { SlashCommand } from "@src/lib/handlers/SlashCommandHandler";

function getCommandCategories() {
    let categories = [];

    bot.commands.global.cache.forEach((cmd) => {
        if (
            !categories.includes(cmd.help.category?.toUpperCase()) &&
            cmd.help.category?.toUpperCase() !== undefined
        )
            categories.push(cmd.help.category?.toUpperCase());
    });

    categories.push("NONE");

    categories = categories.sort();

    return categories;
}

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("See help pages for all bot commands.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("categories")
                .setDescription("List all command categories."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("category")
                .setDescription("See all commands in a category.")
                .addStringOption((string) =>
                    string
                        .setName("category")
                        .setDescription("Command Category")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("command")
                .setDescription("See the help page for a command.")
                .addStringOption((string) =>
                    string
                        .setName("command")
                        .setDescription("A slash command.")
                        .setRequired(true),
                ),
        ),
    help: {
        name: "help",
        category: "utilities",
        description: "See help pages for all bot commands.",
        usage: "help list-categories: category?: command?:",
    },
    async execute(interaction: ChatInputCommandInteraction) {
        // inside a command, event listener, etc.
        const helpEmbed = new EmbedBuilder()
            .setColor(0x6afcc9)
            .setTitle("Help Menu")
            .setThumbnail(
                "https://www.clipartmax.com/png/middle/444-4449882_book-hand-drawn-open-pages-free-vector-icon-designed-icon-for-book.png",
            )
            .setTimestamp();

        const subcmdName = interaction.options.getSubcommand();
        const categories: string[] = getCommandCategories();

        if (subcmdName === "list-categories") {
            let categoryListString: string = "";

            categories.forEach(
                (category) =>
                    (categoryListString =
                        categoryListString + `- ${category}\n`),
            );

            helpEmbed.setTitle("Help Menu - Categories");
            helpEmbed.setDescription(codeBlock(categoryListString));

            await interaction.reply({ embeds: [helpEmbed] });
            return;
        }

        if (subcmdName === "category") {
            let category = interaction.options
                .getString("category")
                .toLowerCase();
            let commands: string[] = [];
            let commandsString = "";

            if (!categories.includes(category.toUpperCase())) {
                helpEmbed.setDescription("That category does not exist.");
                await interaction.reply({ embeds: [helpEmbed] });
                return;
            }

            helpEmbed.setTitle(`Help Menu - Category: ${category}`);

            if (category === "none") {
                bot.commands.global.cache.forEach(
                    (cmd) =>
                        (!cmd.help.category ||
                            cmd.help.category === "" ||
                            cmd.help.category === "none") &&
                        commands.push(cmd.help.name),
                );
            } else {
                bot.commands.global.cache.forEach(
                    (cmd) =>
                        cmd.help.category === category &&
                        commands.push(cmd.help.name),
                );
            }

            if (commands.length < 1) {
                helpEmbed.setDescription(
                    "This category does not have commands.",
                );
                await interaction.reply({ embeds: [helpEmbed] });
                return;
            }

            commands
                .sort()
                .forEach(
                    (cmd) => (commandsString = commandsString + `- ${cmd}\n`),
                );
            helpEmbed.setDescription(codeBlock(commandsString));
            await interaction.reply({ embeds: [helpEmbed] });
            return;
        }

        if (subcmdName === "command") {
            const commandName = interaction.options
                .getString("command")
                .toLowerCase();
            const command = bot.commands.global.cache.find(
                (cmd) => cmd.help.name.toLowerCase() === commandName,
            );

            if (!command) {
                helpEmbed.setDescription("That command does not exist.");
                await interaction.reply({ embeds: [helpEmbed] });
                return;
            }

            const help = command.help;
            let examplesString = "";
            let category: string = "";

            for (const example in help.examples) {
                examplesString += `${example}, `;
            }

            if (help.category === undefined) {
                category = "None";
            } else category = help.category;

            helpEmbed.setTitle(`Help Menu - Command: \`${commandName}\``);
            helpEmbed.addFields(
                { name: "Name", value: `${help.name}`, inline: true },
                {
                    name: "Category",
                    value: `${category}` || "None",
                    inline: true,
                },
                {
                    name: "Description",
                    value: `${help.description}`,
                    inline: true,
                },
                { name: "Usage", value: codeBlock(help.usage), inline: false },
                {
                    name: "Permissions",
                    value: `${help.permissions || "None"}`,
                    inline: true,
                },
                {
                    name: "Developer Only?",
                    value: `${(command.flags?.developerOnly && "Yes") || "No"}`,
                    inline: true,
                },
                {
                    name: "Server Only?",
                    value: `${(command.flags?.guildOnly && "Yes") || "No"}`,
                    inline: true,
                },
                {
                    name: "DMs Only?",
                    value: `${(command.flags?.dmOnly && "Yes") || "No"}`,
                    inline: true,
                },
                {
                    name: "Disabled?",
                    value: `${(command.flags?.disabled && "Yes") || "No"}`,
                    inline: true,
                },
                // { name: 'Examples', value: `${examplesString}` },
            );

            await interaction.reply({ embeds: [helpEmbed] });
            return;
        }

        helpEmbed.setDescription(
            `Use ${codeBlock(
                "/help categories",
            )} to see all available command categories.`,
        );
        await interaction.reply({ embeds: [helpEmbed] });
        return;
    },
};

module.exports = command;
