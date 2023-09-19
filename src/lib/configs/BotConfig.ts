export default interface BotConfig {
    token: string;
    inviteURL: string;
    developerGuildURL: string;
    botUserID: string;

    developers: string[];
    developerGuildID: string;
    developerLogChannelID: string;

    userOnline: "online" | "idle" | "dnd" | "invisible";
    userStatuses?: string[];
    userStatus?: string;

    description?: string;
}

export interface Folders {
    root: string;
    logs: string;
    commands: string;
    events: string;
    components: string;
    lib: string;
}
