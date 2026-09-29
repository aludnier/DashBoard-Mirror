import React, { useEffect, useState } from "react"

function ThemeButton() {
    type theme = 'dark' | 'light'

    const [currtheme, setCurrTheme] = useState<theme>(() => {
        const storedTheme = localStorage.getItem('theme')
        if (storedTheme) {
            return storedTheme as theme
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })

    function handleThemeChange() {
        setCurrTheme((currtheme === 'dark') ? 'light' : 'dark')
    }

    useEffect(() => {
        localStorage.setItem('theme', currtheme)
        document.documentElement.setAttribute('data-theme', currtheme)
    }, [currtheme])

    return (
        <button onClick={handleThemeChange}>Change Theme</button>
        )
}

export default ThemeButton
