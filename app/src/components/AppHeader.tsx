import type { ReactNode } from "react";
import { linkTo } from "../lib/router";
import { asset } from "../lib/assets";
import "./AppHeader.css";

type Props = {
  /** Extra controls placed before "New chat", e.g. a Past chats toggle on the chat screen. */
  pastChats?: ReactNode;
};

/** Shared top bar: wordmark, emoji-style nav (a sticker pops in on hover), New chat, avatar. */
export function AppHeader({ pastChats }: Props) {
  return (
    <header className="db-header">
      <a href="/" onClick={linkTo("/")} className="db-wordmark">AI Docbuilder</a>
      <nav aria-label="Main" className="db-enav">
        <a href="/folders" onClick={linkTo("/folders")}><img src={asset("icon-folder.svg")} alt="" />Folders</a>
        {pastChats ?? (
          <a href="/chat?past=1" onClick={linkTo("/chat?past=1")}><img src={asset("icon-chat.svg")} alt="" />Past chats</a>
        )}
        <a href="/chat" onClick={linkTo("/chat")} className="db-btn db-btn--primary db-newchat">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" /></svg>
          New chat
        </a>
        <span aria-label="Your account" role="img" className="db-avatar">K</span>
      </nav>
    </header>
  );
}
