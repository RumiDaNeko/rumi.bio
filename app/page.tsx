"use client";

import CircularGalleryBase from "@/components/CircularGallery";
import CountUpBase from "@/components/CountUp";
import CurvedLoopBase from "@/components/CurvedLoop";
import DecryptedTextBase from "@/components/DecryptedText";
import GradualBlurBase from "@/components/GradualBlur";
import ShinyTextBase from "@/components/ShinyText";
import SpotlightCardBase from "@/components/SpotlightCard";
import SquaresBase from "@/components/Squares";
import StaggeredMenuBase from "@/components/StaggeredMenu";
import TextTypeBase from "@/components/TextType";
import {
  FaDiscord,
  FaGithub,
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeMute,
  FaVolumeUp,
  FaMusic,
  FaChevronDown
} from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import type { ComponentType } from "react";

type LooseComponent = ComponentType<Record<string, unknown>>;

const CircularGallery = CircularGalleryBase as unknown as LooseComponent;
const CountUp = CountUpBase as unknown as LooseComponent;
const CurvedLoop = CurvedLoopBase as unknown as LooseComponent;
const DecryptedText = DecryptedTextBase as unknown as LooseComponent;
const GradualBlur = GradualBlurBase as unknown as LooseComponent;
const ShinyText = ShinyTextBase as unknown as LooseComponent;
const SpotlightCard = SpotlightCardBase as unknown as LooseComponent;
const Squares = SquaresBase as unknown as LooseComponent;
const StaggeredMenu = StaggeredMenuBase as unknown as LooseComponent;
const TextType = TextTypeBase as unknown as LooseComponent;

const fallbackAvatarUrl = "https://media.harumi.io.vn/b1b309ef51130584278d71550927df9d.webp";
const fallbackBannerBackground = "linear-gradient(135deg, rgba(236, 134, 134, 0.28), rgba(142, 232, 255, 0.18))";
const discordUserId = process.env.NEXT_PUBLIC_DISCORD_USER_ID;

type LanyardUser = {
  id: string;
  avatar?: string | null;
  banner?: string | null;
};

type DiscordStatus = "online" | "idle" | "dnd" | "offline";

type LanyardActivity = {
  name?: string;
  type?: number;
  details?: string | null;
  state?: string | null;
};

type LanyardData = {
  activities?: LanyardActivity[];
  discord_status?: DiscordStatus;
  discord_user?: LanyardUser;
  spotify?: {
    artist?: string;
    song?: string;
    album?: string;
    album_art_url?: string | null;
    track_id?: string | null;
  } | null;
};

type LanyardResponse = {
  success?: boolean;
  data?: LanyardData;
};

function presenceLabel(status?: DiscordStatus) {
  if (status === "dnd") return "do not disturb";
  return status ?? "offline";
}

function discordAvatarUrl(user: LanyardUser) {
  if (!user.avatar) return fallbackAvatarUrl;
  const extension = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
}

function discordBannerUrl(user: LanyardUser) {
  if (!user.banner) return null;
  const extension = user.banner.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${extension}?size=480`;
}

function activityLabel(data?: LanyardData): { status: string; text: string } {
  if (data?.spotify?.song) {
    return {
      status: "Listening to",
      text: `${data.spotify.song}${data.spotify.artist ? ` — ${data.spotify.artist}` : ""}`
    };
  }

  const activity = data?.activities?.find(item => item.type !== 4 && item.name && item.name !== "Spotify");
  if (!activity) {
    return { status: "Using", text: "No current Discord activity" };
  }

  const verbs: Record<number, string> = {
    0: "Playing",
    1: "Streaming",
    2: "Listening to",
    3: "Watching",
    5: "Competing in",
  };

  return {
    status: verbs[activity.type ?? 0] ?? "Using",
    text: activity.details || activity.name || ""
  };
}

const menuItems = [
  { label: "Home", ariaLabel: "Go to home page", link: "/" },
  { label: "Blog", ariaLabel: "Visit blog", link: "https://blog.harumi.io.vn" },
  { label: "Cloudcode", ariaLabel: "Visit Cloudcode", link: "https://cloudcode.io.vn" },
];

const socialItems = [
  { label: "Discord", link: "https://discord.gg/BMzQcBG2Cj" },
  { label: "GitHub", link: "https://github.com/RumiDaNeko" },
  { label: "BuiltByBit", link: "https://builtbybit.com/members/harumi.517696/" },
];

const galleryItems = [
  { image: "https://media.harumi.io.vn/Non%20Transparent.png", text: "Cloudcode" },
  { image: "https://media.harumi.io.vn/IMG_0009.jpeg", text: "à u ì" },
  { image: "https://media.harumi.io.vn/IMG_0479.png", text: "Overlix" },
  { image: "https://media.harumi.io.vn/R.jpg", text: "My University" },
];

const stats = [
  {
    value: 18,
    label: "Years online",
    text: "Learning security, servers, and how to keep shipping anyway.",
  },
  {
    value: 2000,
    label: "Dollars invested",
    text: "Hardware, hosting, experiments, and mistakes that became lessons.",
  },
  {
    value: 4,
    label: "VPS nodes",
    text: "Mostly keeping Cloudcode alive and side quests running.",
  },
];

const projects = [
  {
    name: "Cloudcode Hosting",
    tag: "main build",
    text: "A hosting project for people who want servers without the boring control-panel mess.",
    href: "https://cloudcode.io.vn",
  },
  {
    name: "Overlix",
    tag: "side quest",
    text: "A scrappy infrastructure experiment, mostly useful for learning what breaks under real users.",
  },
  {
    name: "Security Lab Notes",
    tag: "research",
    text: "CTF reps, Linux hardening, network weirdness, and defensive break-fix practice.",
    href: "https://github.com/RumiDaNeko",
  },
];

const stack = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Linux", "Docker", "VPS", "Cloudflare", "Discord APIs", "Cybersecurity"];

const links = [
  { href: "https://blog.harumi.io.vn", label: "Blog" },
  { href: "https://cloudcode.io.vn", label: "Cloudcode" },
  { href: "https://github.com/RumiDaNeko", label: "GitHub", icon: "github" },
  { href: "https://discord.gg/BMzQcBG2Cj", label: "Discord", icon: "discord" },
];

async function fetchID3(url: string) {
  try {
    const response = await fetch(url, { headers: { Range: "bytes=0-15000" } });
    if (!response.ok && response.status !== 206) return null;
    const arrayBuffer = await response.arrayBuffer();
    const view = new DataView(arrayBuffer);

    if (view.getUint8(0) !== 0x49 || view.getUint8(1) !== 0x44 || view.getUint8(2) !== 0x33) {
      return null;
    }

    const s0 = view.getUint8(6), s1 = view.getUint8(7), s2 = view.getUint8(8), s3 = view.getUint8(9);
    const tagSize = (s0 << 21) | (s1 << 14) | (s2 << 7) | s3;

    let offset = 10;
    let title = "";
    let artist = "";

    const limit = Math.min(tagSize, arrayBuffer.byteLength - 10);
    while (offset < limit) {
      let frameId = "";
      for (let i = 0; i < 4; i++) {
        const charCode = view.getUint8(offset + i);
        if (charCode >= 32 && charCode <= 126) frameId += String.fromCharCode(charCode);
      }

      if (frameId.length < 4) break;

      const fSize = view.getUint32(offset + 4);
      if (fSize <= 0 || offset + 10 + fSize > arrayBuffer.byteLength) break;

      if (frameId === "TIT2" || frameId === "TPE1") {
        const encoding = view.getUint8(offset + 10);
        const dataStart = offset + 11;
        const dataLength = fSize - 1;
        const decoder = new TextDecoder(encoding === 1 || encoding === 2 ? "utf-16" : "utf-8");
        const strBytes = new Uint8Array(arrayBuffer, dataStart, dataLength);
        const text = decoder.decode(strBytes).replace(/\0/g, "").trim();

        if (frameId === "TIT2") title = text;
        if (frameId === "TPE1") artist = text;
      }

      offset += 10 + fSize;
    }

    if (title || artist) {
      return { title: title || "Unknown Track", artist: artist || "Unknown Artist" };
    }
  } catch {
    // Fail silently
  }
  return null;
}

function parseUrlFilename(url: string) {
  try {
    const filename = url.substring(url.lastIndexOf("/") + 1);
    const clean = decodeURIComponent(filename)
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ");
    return clean.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  } catch {
    return "Unknown Track";
  }
}

const playlist = [
  "https://media.harumi.io.vn/Reply_8bit.mp3",
  "https://media.harumi.io.vn/StarrySea_8bit.mp3",
  "https://media.harumi.io.vn/Remember_8bit.mp3"
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(fallbackAvatarUrl);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus>("offline");
  const [discordActivity, setDiscordActivity] = useState<{ status: string; text: string }>({ status: "Using", text: "No current Discord activity" });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [trackMeta, setTrackMeta] = useState<{ title: string; artist: string }>({ title: "Loading...", artist: "..." });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!discordUserId) return;

    let cancelled = false;

    fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`)
      .then(response => (response.ok ? response.json() : null))
      .then((payload: LanyardResponse | null) => {
        if (!payload?.success || cancelled) return;
        const user = payload.data?.discord_user;
        if (user) {
          setAvatarUrl(discordAvatarUrl(user));
          setBannerUrl(discordBannerUrl(user));
        }
        setDiscordStatus(payload.data?.discord_status ?? "offline");
        setDiscordActivity(activityLabel(payload.data));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const url = playlist[currentTrackIndex];
    setTrackMeta({ title: "Loading...", artist: "..." });

    fetchID3(url).then((meta) => {
      if (meta) {
        setTrackMeta(meta);
      } else {
        setTrackMeta({
          title: parseUrlFilename(url),
          artist: "Audio Node"
        });
      }
    });

    if (!audioRef.current) return;
    audioRef.current.src = url;
    audioRef.current.volume = isMuted ? 0 : volume;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    let started = false;
    const startAudio = () => {
      if (started) return;
      started = true;
      if (audioRef.current) {
        if (!audioRef.current.src) {
          audioRef.current.src = playlist[currentTrackIndex];
        }
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            started = false;
          });
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("click", startAudio);
      window.removeEventListener("keydown", startAudio);
      window.removeEventListener("touchstart", startAudio);
    };

    window.addEventListener("click", startAudio);
    window.addEventListener("keydown", startAudio);
    window.addEventListener("touchstart", startAudio);

    return cleanup;
  }, [currentTrackIndex, volume, isMuted]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  return (
    <main className="rumi-page">
      <div className={`rumi-blur ${menuOpen ? "is-open" : ""}`} aria-hidden="true" onClick={() => setMenuOpen(false)} />

      <nav className={`rumi-menu ${menuOpen ? "is-open" : ""}`} aria-label="Main menu">
        <StaggeredMenu
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials
          displayItemNumbering={false}
          menuButtonColor="#fff7fb"
          openMenuButtonColor="#050509"
          changeMenuColorOnOpen
          colors={["#ffd1da", "#ec8686"]}
          logoUrl={avatarUrl}
          wordmarkUrl="https://media.harumi.io.vn/harumi-sign.png"
          accentColor="#ec8686"
          onMenuOpen={() => setMenuOpen(true)}
          onMenuClose={() => setMenuOpen(false)}
        />
      </nav>

      <section className="rumi-hero" aria-labelledby="hero-title">
        <video className="rumi-hero-video" autoPlay muted loop playsInline poster={avatarUrl}>
          <source src="https://sbucket.harumi.io.vn/wallpaph.mp4" type="video/mp4" />
        </video>
        <div className="rumi-hero-shade" aria-hidden="true" />
        <GradualBlur target="parent" position="bottom" height="8rem" strength={2} divCount={5} curve="bezier" exponential opacity={1} />

        <div className="rumi-hero-grid">
          <p className="rumi-kicker">Vietnam / Cybersecurity / Cloudcode</p>
          <SpotlightCard className="rumi-operator-card" spotlightColor="rgba(236, 134, 134, 0.22)">
            <div
              className="rumi-banner"
              style={{
                background: bannerUrl ? `url(${bannerUrl}) center/cover no-repeat` : fallbackBannerBackground
              }}
            />
            <div className="rumi-card-topline">
              <span>Operator badge</span>
              <span className="rumi-live" data-status={discordStatus}>{presenceLabel(discordStatus)}</span>
            </div>
            <div className="rumi-identity">
              <span className="rumi-avatar-frame">
                <img src={avatarUrl} alt="Rumi avatar" />
              </span>
              <div>
                <h1 id="hero-title">
                  <TextType as="span" text="Hi, I'm Rumi." typingSpeed={70} pauseDuration={1600} showCursor cursorCharacter="_" />
                </h1>
                <p>
                  <DecryptedText
                    text="Cybersecurity student in Vietnam. Building Cloudcode, breaking things safely, keeping the servers alive."
                    speed={70}
                    maxIterations={60}
                    animateOn="view"
                    revealDirection="start"
                    sequential
                  />
                </p>
                <div className="rumi-presence-note">
                  <span>{discordActivity.status}</span>
                  {discordActivity.text}
                </div>
              </div>
            </div>
            <div className="rumi-actions" aria-label="Primary links">
              {links.map(link => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  {link.icon === "github" && <FaGithub aria-hidden="true" />}
                  {link.icon === "discord" && <FaDiscord aria-hidden="true" />}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </section>

      <section id="gallery" className="rumi-section rumi-gallery-section" aria-labelledby="gallery-title">
        <div className="rumi-section-heading">
          <p className="rumi-kicker">field notes</p>
          <h2 id="gallery-title">Favorite fragments from the lab.</h2>
          <ShinyText text="Cloudcode, memories, friends, and the little things worth showing." speed={5} className="rumi-subtitle" />
        </div>
        <div className="rumi-gallery-panel">
          <CircularGallery items={galleryItems} bend={0} textColor="#fff7fb" borderRadius={0.08} scrollEase={0.03} />
        </div>
      </section>

      <section className="rumi-section rumi-about" aria-labelledby="about-title">
        <CurvedLoop
          marqueeText="What about my not-so-boring life? ✦ "
          speed={2}
          curveAmount={-160}
          direction="left"
          interactive={false}
          className="rumi-loop-text"
        />

        <div className="rumi-section-heading rumi-section-heading-center">
          <p className="rumi-kicker">status report</p>
          <h2 id="about-title">Stats, scars, and servers</h2>
        </div>

        <div className="rumi-card-grid">
          <SpotlightCard className="rumi-about-card" spotlightColor="rgba(142, 232, 255, 0.16)">
            <span className="rumi-avatar-frame rumi-avatar-frame-small">
              <img src={avatarUrl} alt="Rumi logo" />
            </span>
            <h3>About me</h3>
            <p>I'm Haruka Kanemari, also known as Rumi. I build Cloudcode hosting and learn security by making real things run.</p>
          </SpotlightCard>

          {stats.map(stat => (
            <SpotlightCard key={stat.label} className="rumi-stat-card" spotlightColor="rgba(236, 134, 134, 0.18)">
              <CountUp from={0} to={stat.value} separator="," duration={2.4} className="rumi-stat-value" />
              <h3>{stat.label}</h3>
              <p>{stat.text}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section id="projects" className="rumi-section rumi-projects" aria-labelledby="projects-title">
        <div className="rumi-section-heading">
          <p className="rumi-kicker">proof of work</p>
          <h2 id="projects-title">Projects with fingerprints on them.</h2>
          <p>Not polished case studies. Real builds, real servers, real weird bugs.</p>
        </div>
        <div className="rumi-project-grid">
          {projects.map(project => (
            <SpotlightCard key={project.name} className="rumi-project-card" spotlightColor="rgba(236, 134, 134, 0.14)">
              <p className="rumi-project-tag">{project.tag}</p>
              <h3>{project.name}</h3>
              <p>{project.text}</p>
              {project.href && (
                <a href={project.href} target="_blank" rel="noreferrer">
                  Open project
                </a>
              )}
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section id="stack" className="rumi-section rumi-stack-section" aria-labelledby="stack-title">
        <div className="rumi-section-heading rumi-section-heading-center">
          <p className="rumi-kicker">toolbox</p>
          <h2 id="stack-title">Stuff I actually touch.</h2>
        </div>
        <div className="rumi-stack-list" aria-label="Tech stack">
          {stack.map(item => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section id="contact" className="rumi-close" aria-labelledby="contact-title">
        <Squares speed={0.35} squareSize={18} direction="diagonal" borderColor="rgba(255,255,255,.12)" hoverFillColor="rgba(236,134,134,.18)" />
        <div className="rumi-close-card">
          <p className="rumi-kicker">next hop</p>
          <h2 id="contact-title">Want to trace the route?</h2>
          <p>Need hosting, a collab, or someone to look at weird server behavior? Start here.</p>
          <div className="rumi-actions">
            {links.map(link => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.icon === "github" && <FaGithub aria-hidden="true" />}
                {link.icon === "discord" && <FaDiscord aria-hidden="true" />}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="rumi-footer">
        <span>Rumi / Haruka Kanemari</span>
        <span>Discord: {presenceLabel(discordStatus)}</span>
        <span>Built with Next.js, caffeine, and VPS bills.</span>
      </footer>

      {/* Floating Audio Player */}
      <audio
        ref={audioRef}
        onEnded={handleNextTrack}
        preload="none"
      />

      <div className={`rumi-audio-player-widget ${isMinimized ? "is-minimized" : ""}`} aria-label="Audio deck">
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="rumi-player-trigger"
            aria-label="Open audio deck"
            title="Open audio deck"
          >
            <FaMusic className={`rumi-music-node-icon ${isPlaying ? "is-playing" : ""}`} />
            {isPlaying && (
              <span className="rumi-trigger-ping" />
            )}
          </button>
        ) : (
          <div className="rumi-player-deck">
            <div className="rumi-deck-header">
              <span className="rumi-deck-title">Audio Node</span>
              <button
                onClick={() => setIsMinimized(true)}
                className="rumi-deck-minimize"
                aria-label="Collapse deck"
                title="Collapse deck"
              >
                <FaChevronDown />
              </button>
            </div>

            <div className="rumi-deck-body">
              <div className="rumi-deck-track-info">
                <p className="rumi-deck-song-name">{trackMeta.title}</p>
                <p className="rumi-deck-artist-name">{trackMeta.artist}</p>
              </div>

              {isPlaying && (
                <div className="rumi-deck-visualizer" aria-hidden="true">
                  <span className="bar" />
                  <span className="bar" />
                  <span className="bar" />
                  <span className="bar" />
                  <span className="bar" />
                </div>
              )}
            </div>

            <div className="rumi-deck-controls">
              <button onClick={handlePrevTrack} className="rumi-deck-btn" aria-label="Previous track" title="Previous track">
                <FaStepBackward />
              </button>
              <button onClick={handlePlayPause} className="rumi-deck-btn play-btn" aria-label={isPlaying ? "Pause" : "Play"} title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={handleNextTrack} className="rumi-deck-btn" aria-label="Next track" title="Next track">
                <FaStepForward />
              </button>
              <button onClick={() => setIsMuted(!isMuted)} className="rumi-deck-btn" aria-label={isMuted ? "Unmute" : "Mute"} title={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
            </div>

            <div className="rumi-deck-volume">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="rumi-deck-volume-slider"
                aria-label="Volume"
                style={{
                  background: `linear-gradient(to right, var(--rumi-blush) 0%, var(--rumi-blush) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.12) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.12) 100%)`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
