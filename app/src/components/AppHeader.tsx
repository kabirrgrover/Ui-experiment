import type { MouseEvent, ReactNode } from "react";
import { linkTo, navigate } from "../lib/router";
import { asset } from "../lib/assets";
import { BrandLogo } from "./BrandLogo";
import "./AppHeader.css";

type Props = {
  /** Extra controls placed before "New chat", e.g. a Past chats toggle on the chat screen. */
  pastChats?: ReactNode;
  /** Marks the current section in the nav. */
  current?: "folders" | "chat";
};

/** New chat: on /chat it opens another tab (the chat screen listens for this event); elsewhere it goes to /chat?new=1. */
function newChat(e: MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  if (window.location.pathname.startsWith("/chat")) window.dispatchEvent(new Event("db:newchat"));
  else navigate("/chat?new=1");
}

/** Shared top bar: company logo slot, wordmark, emoji-style nav (a sticker pops in on hover), New chat, avatar. */
export function AppHeader({ pastChats, current }: Props) {
  return (
    <header className="db-header">
      <span className="db-brand">
        <BrandLogo />
        <a href="/" onClick={linkTo("/")} className="db-wordmark">AI Docbuilder</a>
      </span>
      <nav aria-label="Main" className="db-enav">
        <a href="/folders" onClick={linkTo("/folders")} aria-current={current === "folders" ? "page" : undefined}><img src={asset("icon-folder.svg")} alt="" />Folders</a>
        {pastChats ?? (
          <a href="/chat?past=1" onClick={linkTo("/chat?past=1")}><img src={asset("icon-chat.svg")} alt="" />Past chats</a>
        )}
        <a href="/chat?new=1" onClick={newChat} className="db-btn db-btn--primary db-newchat">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" /></svg>
          New chat
        </a>
        <span aria-label="Your account" role="img" className="db-avatar">K</span>
      </nav>
    </header>
  );
}
