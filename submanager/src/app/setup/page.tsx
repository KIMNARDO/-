"use client";

import { useState } from "react";
import {
  Layers,
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  Shield,
  ArrowRight,
  Mail,
  Database,
  Key,
} from "lucide-react";
import Link from "next/link";

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Google Cloud 프로젝트",
    icon: Key,
    description: "Google OAuth를 위한 프로젝트를 만듭니다",
  },
  {
    id: 2,
    title: "Gmail API 활성화",
    icon: Mail,
    description: "이메일 읽기 권한을 설정합니다",
  },
  {
    id: 3,
    title: "Supabase 연결",
    icon: Database,
    description: "데이터 저장소를 설정합니다",
  },
  {
    id: 4,
    title: "완료",
    icon: Check,
    description: "모든 준비가 끝났습니다",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      {copied ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? "복사됨" : "복사"}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="group relative mt-2 rounded-lg border border-border bg-muted">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Terminal
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-3 text-xs">
        <code className="text-foreground">{code}</code>
      </pre>
    </div>
  );
}

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              step < currentStep
                ? "bg-success text-white"
                : step === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {step < currentStep ? <Check className="h-4 w-4" /> : step}
          </div>
          {step < totalSteps && (
            <div
              className={`h-px w-8 transition-colors ${
                step < currentStep ? "bg-success" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function GoogleCloudStep() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/50">
        <div className="flex gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-blue-600 mt-0.5 dark:text-blue-400" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              시작하기 전에
            </p>
            <p className="mt-1 text-xs text-blue-800 dark:text-blue-300">
              Google 계정이 필요합니다. Gmail을 사용하고 계시다면 이미 계정이
              있습니다. 무료로 설정할 수 있으며 카드 등록은 필요하지 않습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-sm font-semibold">
            Step 1. Google Cloud Console 접속
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            아래 링크를 클릭하여 Google Cloud Console에 접속합니다.
          </p>
          <a
            href="https://console.cloud.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-primary hover:bg-accent transition-colors"
          >
            Google Cloud Console 열기
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-sm font-semibold">Step 2. 새 프로젝트 생성</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            상단 프로젝트 선택 드롭다운 → &quot;새 프로젝트&quot; 클릭
          </p>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                1
              </span>
              <span>
                프로젝트 이름: <strong className="text-foreground">SubManager</strong> 입력
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                2
              </span>
              <span>&quot;만들기&quot; 클릭 → 프로젝트 생성 완료까지 약 30초 소요</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-sm font-semibold">Step 3. OAuth 동의 화면 설정</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            왼쪽 메뉴: API 및 서비스 → OAuth 동의 화면
          </p>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                1
              </span>
              <span>
                User Type: <strong className="text-foreground">외부 (External)</strong> 선택
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                2
              </span>
              <span>앱 이름: SubManager, 이메일: 본인 이메일 입력</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                3
              </span>
              <span>나머지는 기본값 유지 → &quot;저장 후 계속&quot;</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-sm font-semibold">Step 4. OAuth 클라이언트 ID 생성</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            왼쪽 메뉴: 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID
          </p>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                1
              </span>
              <span>
                애플리케이션 유형: <strong className="text-foreground">웹 애플리케이션</strong>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                2
              </span>
              <span>승인된 리디렉션 URI에 아래 주소 추가:</span>
            </div>
          </div>
          <CodeBlock code="http://localhost:3000/api/auth/callback/google" />
          <p className="mt-3 text-xs text-muted-foreground">
            생성된 <strong className="text-foreground">클라이언트 ID</strong>와{" "}
            <strong className="text-foreground">클라이언트 보안 비밀번호</strong>를
            .env.local 파일에 저장합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function GmailApiStep() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/50">
        <div className="flex gap-3">
          <Shield className="h-4 w-4 shrink-0 text-green-600 mt-0.5 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-200">
              보안 안내
            </p>
            <p className="mt-1 text-xs text-green-800 dark:text-green-300">
              SubManager는 <strong>gmail.readonly</strong> 권한만 요청합니다. 이메일을
              읽기만 하며, 절대 수정하거나 삭제하지 않습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-sm font-semibold">Step 1. Gmail API 활성화</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Google Cloud Console에서 Gmail API를 활성화합니다.
          </p>
          <a
            href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-primary hover:bg-accent transition-colors"
          >
            Gmail API 페이지 열기
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            &quot;사용&quot; 버튼을 클릭하면 활성화됩니다.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-sm font-semibold">
            Step 2. .env.local 파일 설정
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            프로젝트 루트에 .env.local 파일을 만들고 아래 내용을 입력합니다.
          </p>
          <CodeBlock
            code={`# Google OAuth (이전 단계에서 생성한 값 입력)
GOOGLE_CLIENT_ID=여기에_클라이언트_ID_붙여넣기
GOOGLE_CLIENT_SECRET=여기에_시크릿_붙여넣기

# NextAuth (아래 명령어로 생성)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=아래_명령어로_생성`}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            NEXTAUTH_SECRET 생성 명령어:
          </p>
          <CodeBlock code="openssl rand -base64 32" />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-sm font-semibold">Step 3. 테스트 사용자 추가</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            OAuth 동의 화면이 &quot;테스트&quot; 상태일 때는 허용된 사용자만 로그인할 수
            있습니다.
          </p>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                1
              </span>
              <span>
                OAuth 동의 화면 → &quot;테스트 사용자&quot; 섹션 → &quot;사용자 추가&quot;
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                2
              </span>
              <span>본인 Gmail 주소를 추가합니다</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupabaseStep() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold">Step 1. Supabase 프로젝트 생성</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Supabase에서 무료 프로젝트를 만듭니다.
        </p>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-primary hover:bg-accent transition-colors"
        >
          Supabase Dashboard 열기
          <ExternalLink className="h-3 w-3" />
        </a>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              1
            </span>
            <span>&quot;New Project&quot; 클릭</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              2
            </span>
            <span>
              프로젝트 이름: <strong className="text-foreground">submanager</strong>,
              비밀번호 설정, Region: Northeast Asia (Tokyo)
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold">Step 2. API 키 확인</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Settings → API 에서 아래 값을 확인합니다.
        </p>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              1
            </span>
            <span>
              <strong className="text-foreground">Project URL</strong> →
              NEXT_PUBLIC_SUPABASE_URL에 입력
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              2
            </span>
            <span>
              <strong className="text-foreground">anon public</strong> 키 →
              NEXT_PUBLIC_SUPABASE_ANON_KEY에 입력
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              3
            </span>
            <span>
              <strong className="text-foreground">service_role</strong> 키 →
              SUPABASE_SERVICE_ROLE_KEY에 입력
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold">Step 3. 데이터베이스 테이블 생성</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Supabase → SQL Editor에서 아래 SQL을 실행합니다.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          프로젝트의 <code className="rounded bg-muted px-1 py-0.5 text-foreground">supabase-schema.sql</code> 파일
          내용을 복사해서 붙여넣고 &quot;Run&quot; 을 클릭하세요.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold">Step 4. .env.local 최종 확인</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          모든 환경변수가 입력되었는지 확인합니다.
        </p>
        <CodeBlock
          code={`GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
        />
      </div>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
        <Check className="h-8 w-8 text-success" />
      </div>
      <h3 className="mt-4 text-lg font-bold">설정 완료!</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        모든 준비가 끝났습니다. 이제 이메일을 스캔하여
        <br />
        구독 서비스를 자동으로 감지해보세요.
      </p>
      <div className="mt-6 space-y-3">
        <Link
          href="/dashboard"
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          대시보드로 이동
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-muted-foreground">
          앱을 시작하려면 먼저{" "}
          <code className="rounded bg-muted px-1 py-0.5">npm run dev</code>를
          실행하세요
        </p>
      </div>
    </div>
  );
}

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const stepContent: Record<number, React.ReactNode> = {
    1: <GoogleCloudStep />,
    2: <GmailApiStep />,
    3: <SupabaseStep />,
    4: <CompleteStep />,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Layers className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              SubManager
            </span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">초기 설정</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            3단계만 완료하면 바로 사용할 수 있습니다
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10 flex justify-center">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        </div>

        {/* Step Title */}
        {currentStep <= steps.length && (
          <div className="mb-6">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = steps[currentStep - 1].icon;
                return (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                );
              })()}
              <div>
                <h2 className="text-lg font-semibold">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {steps[currentStep - 1].description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="page-enter">{stepContent[currentStep]}</div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </button>
            <button
              onClick={() =>
                setCurrentStep((s) => Math.min(steps.length, s + 1))
              }
              className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {currentStep === 3 ? "완료" : "다음"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
