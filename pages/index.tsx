import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    const host = process.env.VERCEL_URL || 'http://localhost:3000';
    const clientId = 'tqj79y9ynmjj7d48qw081bchpmttq4';
    const url = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(host)}&response_type=token&scope=channel%3Amoderate+chat%3Aedit+chat%3Aread+moderator%3Amanage%3Abanned_users+moderator%3Amanage%3Achat_messages`;
    return (
        <>
            <div id="twitch_auth_link">
                <a href={ url }>
                    Authorize with Twitch
                </a>
            </div>

            <div id="connection_form_wrapper">
                <div className="input-wrapper">
                    <label htmlFor="channel_name">Twitch Channel Name:</label><br />
                    <input id="channel_name" type="text" />
                </div>

                <div className="input-wrapper">
                    <label htmlFor="discord_token">Discord Token:</label><br />
                    <input id="discord_token" type="password" />
                </div>

                <div className="input-wrapper">
                    <label htmlFor="channel_id">Discord Channel ID:</label><br />
                    <input id="channel_id" type="number" />
                </div>

                <div id="connection_info" className="flex-center green"></div>

                <div id="buttons" className="flex-center">
                    <button id="connect_button">
                        Connect
                    </button>
                    <button id="disconnect_button">
                        Disconnect
                    </button>
                </div>
            </div>
        </>
    )
}
