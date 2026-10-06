"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Post = { id: string; content: string; created_at: string };

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone?: "error" | "success" }>({ text: "" });
  const today = useMemo(
    () => new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", weekday: "short" }).format(new Date()),
    []
  );

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id, content, created_at")
      .order("created_at", { ascending: false });
    if (error) setNotice({ text: "기록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.", tone: "error" });
    else setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { void loadPosts(); }, []);

  const savePost = async () => {
    const value = content.trim();
    if (!value) { setNotice({ text: "한 줄을 입력해 주세요.", tone: "error" }); return; }
    setSaving(true); setNotice({ text: "" });
    const { error } = await supabase.from("posts").insert({ content: value });
    if (error) {
      setNotice({
        text: error.message.includes("row-level security")
          ? "등록 권한이 아직 설정되지 않았어요. RLS 정책을 확인해 주세요."
          : "저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
        tone: "error",
      });
    } else {
      setContent(""); setNotice({ text: "오늘의 한 줄을 남겼어요.", tone: "success" }); await loadPosts();
    }
    setSaving(false);
  };

  return (
    <main className="page">
      <header>
        <div><p className="eyebrow">ONE LINE A DAY</p><h1>오늘의 한 줄.</h1><p className="intro">길게 쓰지 않아도 괜찮아요. 지금의 마음을 한 줄로 남겨보세요.</p></div>
        <time className="date">{today}</time>
      </header>
      <section className="composer" aria-labelledby="write-title"><div className="composerInner">
        <label id="write-title" htmlFor="content">오늘 어떤 하루였나요?</label>
        <textarea id="content" value={content} maxLength={500} onChange={(event) => setContent(event.target.value)} placeholder="예: 따뜻한 커피 한 잔 덕분에 여유로운 아침이었다." />
        <div className="composerFooter"><span className="count">{content.length} / 500</span><button onClick={() => void savePost()} disabled={saving}>{saving ? "저장 중" : "기록하기"}</button></div>
        <p className={`notice ${notice.tone ?? ""}`} aria-live="polite">{notice.text}</p>
      </div></section>
      <section aria-labelledby="records-title"><div className="listHeading"><h2 id="records-title">쌓인 한 줄</h2><span>{posts.length} RECORD{posts.length === 1 ? "" : "S"}</span></div>
        {loading ? <div className="empty">기록을 불러오는 중이에요</div> : posts.length === 0 ? <div className="empty">아직 남겨진 기록이 없어요.<br />첫 번째 한 줄을 적어보세요.</div> : <div className="records">{posts.map((post) => <article className="record" key={post.id}><p>{post.content}</p><time dateTime={post.created_at}>{formatTime(post.created_at)}</time></article>)}</div>}
      </section>
    </main>
  );
}
