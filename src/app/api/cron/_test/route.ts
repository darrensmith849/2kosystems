import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getCronSecret, detectRuntime, getDeploymentEnv } from '@/lib/runtime';
import { isDbConfigured } from '@/lib/db/client';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function checkAuth(request: NextRequest): boolean {
  const expected = getCronSecret();
  if (!expected) return false;
  const provided = request.headers.get('x-cron-secret');
  if (!provided) return false;
  return provided === expected;
}

function buildBody() {
  return {
    ok: true,
    runtime: detectRuntime(),
    env: getDeploymentEnv(),
    cronSecretConfigured: !!getCronSecret(),
    dbConfigured: isDbConfigured(),
  };
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();
  return NextResponse.json(buildBody());
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();
  return NextResponse.json(buildBody());
}
