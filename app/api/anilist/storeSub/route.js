export async function POST(req) {
  try {
    // проверяем, что это runtime, а не build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      // во время сборки возвращаем пустой объект
      return NextResponse.json({ success: true })
    }

    // получаем тело запроса безопасно
    const body = await req.json().catch(() => ({}))
    const { uid, token } = body

    if (!uid || !token) {
      return NextResponse.json({ error: 'Missing uid or token' }, { status: 400 })
    }

    const { sub } = await decodeJwt(token)

    if (!sub) {
      return NextResponse.json({ error: 'Missing sub in token payload' }, { status: 400 })
    }

    await db.collection('users').doc(uid).update({
      anilistSub: sub,
    })

    return NextResponse.json({ success: true, sub }, { status: 200 })
  } catch (error) {
    console.error('Error in POST /anilist-sub:', error)
    return NextResponse.json({ error: 'Error decoding token or saving sub' }, { status: 500 })
  }
}
