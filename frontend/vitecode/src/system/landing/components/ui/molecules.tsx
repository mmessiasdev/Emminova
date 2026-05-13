"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@landing/lib/utils"

interface MoleculesProps {
    className?: string
    quantity?: number
    staticity?: number
    ease?: number
    size?: number
    color?: string
    lineOpacity?: number
    proximity?: number
    speed?: number
    interactivityStrength?: number
}

export const Molecules: React.FC<MoleculesProps> = ({
    className = "",
    quantity = 100,
    staticity = 50,
    ease = 50,
    size = 1.4,
    color = "#0066FF",
    lineOpacity = 0.8,
    proximity = 160,
    speed = 1,
    interactivityStrength = 1,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const context = useRef<CanvasRenderingContext2D | null>(null)
    const particles = useRef<Particle[]>([])
    const mouse = useRef({ x: 100, y: 100 })
    const canvasSize = useRef({ w: 100, h: 100 })
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1

    interface Particle {
        x: number
        y: number
        vx: number
        vy: number
        radius: number
        z: number // Depth layer: 0 is far, 1 is close
        opacity: number
    }

    useEffect(() => {
        if (canvasRef.current) {
            context.current = canvasRef.current.getContext("2d")
        }

        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                canvasSize.current.w = containerRef.current.offsetWidth
                canvasSize.current.h = containerRef.current.offsetHeight
                canvasRef.current.width = canvasSize.current.w * dpr
                canvasRef.current.height = canvasSize.current.h * dpr
                canvasRef.current.style.width = `${canvasSize.current.w}px`
                canvasRef.current.style.height = `${canvasSize.current.h}px`
                context.current?.scale(dpr, dpr)
                initParticles()
            }
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvasRef.current?.getBoundingClientRect()
            if (rect) {
                mouse.current.x = i(e.clientX - rect.left)
                mouse.current.y = i(e.clientY - rect.top)
            }
        }

        // Helper for mouse smoothing
        function i(v: number) { return v }

        window.addEventListener("resize", handleResize)
        window.addEventListener("mousemove", handleMouseMove)
        handleResize()

        let rafId: number
        const render = () => {
            drawParticles()
            rafId = requestAnimationFrame(render)
        }
        rafId = requestAnimationFrame(render)

        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("mousemove", handleMouseMove)
            cancelAnimationFrame(rafId)
        }
    }, [color])

    const initParticles = () => {
        particles.current = []
        for (let i = 0; i < quantity; i++) {
            const z = Math.random()
            particles.current.push({
                x: Math.random() * canvasSize.current.w,
                y: Math.random() * canvasSize.current.h,
                // DEVAGAR: Velocidade aumentada conforme prop
                vx: (Math.random() - 2) * 0.05 * (1 + z) * speed,
                vy: (Math.random() - 2) * 0.05 * (1 + z) * speed,
                radius: size * (0.4 + z * 1.6),
                z,
                opacity: 0.15 + z * 0.85,
            })
        }
    }

    const drawParticles = () => {
        if (!context.current) return
        const ctx = context.current
        ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h)

        const rgb = hexToRgb(color).join(",")

        // Draw connections
        ctx.lineWidth = 0.5
        for (let i = 0; i < particles.current.length; i++) {
            const p1 = particles.current[i]
            for (let j = i + 1; j < particles.current.length; j++) {
                const p2 = particles.current[j]

                // Conectar apenas camadas próximas
                if (Math.abs(p1.z - p2.z) > 1) continue

                const dx = p1.x - p2.x
                const dy = p1.y - p2.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < proximity) {
                    const opacity = (1 - dist / proximity) * lineOpacity * p1.z * p2.z * 0.5
                    ctx.strokeStyle = `rgba(${rgb}, ${opacity})`
                    ctx.beginPath()
                    ctx.moveTo(p1.x, p1.y)
                    ctx.lineTo(p2.x, p2.y)
                    ctx.stroke()
                }
            }
        }

        // Draw dots
        particles.current.forEach((p) => {
            // Movimento browniano (jitter orgânico) ainda mais lento
            p.vx += (Math.random() - 1) * 0.005
            p.vy += (Math.random() - 1) * 0.005

            // Suavidade extrema na atração do mouse
            const dx = mouse.current.x - p.x
            const dy = mouse.current.y - p.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const attractRange = 400 * p.z

            if (dist < attractRange) {
                const force = (attractRange - dist) / attractRange
                p.vx += dx * 0.0003 * force * p.z * interactivityStrength
                p.vy += dy * 0.0003 * force * p.z * interactivityStrength

                if (dist < 50) {
                    p.vx -= dx * 0.003 * interactivityStrength
                    p.vy -= dy * 0.003 * interactivityStrength
                }
            }

            // Atrito ligeiramente reduzido para mais "viva"
            p.vx *= 0.99
            p.vy *= 0.99

            p.x += p.vx
            p.y += p.vy

            // Render Particle
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)

            // Bloom Effect para camadas frontais
            if (p.z > 0.75) {
                ctx.shadowBlur = 10 * p.z
                ctx.shadowColor = `rgba(${rgb}, ${0.6 * p.z})`
            } else {
                ctx.shadowBlur = 0
            }

            ctx.fillStyle = `rgba(${rgb}, ${p.opacity})`
            ctx.fill()
            ctx.shadowBlur = 0

            // Bounce off edges
            if (p.x < 0 || p.x > canvasSize.current.w) p.vx *= -0.6
            if (p.y < 0 || p.y > canvasSize.current.h) p.vy *= -0.6
        })
    }

    function hexToRgb(hex: string): number[] {
        let h = hex.replace("#", "")
        if (h.length === 3) h = h.split("").map((c) => c + c).join("")
        if (h.length === 8) h = h.substring(0, 6) // Remove o canal alpha extra, se houver
        const i = parseInt(h, 16)
        return isNaN(i) ? [0, 102, 255] : [(i >> 16) & 255, (i >> 8) & 255, i & 255]
    }

    return (
        <div ref={containerRef} className={cn("absolute inset-0 pointer-events-none", className)}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    )
}
