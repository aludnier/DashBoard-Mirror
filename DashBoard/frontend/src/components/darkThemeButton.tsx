import { useEffect, useState, type ChangeEvent } from "react"
import "./darkThemeButton.css"

function ThemeButton() {
    type theme = 'dark' | 'light'

    const [currtheme, setCurrTheme] = useState<theme>(() => {
        const storedTheme = localStorage.getItem('theme')
        if (storedTheme) {
            return storedTheme as theme
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })

    function handleThemeChange(e : ChangeEvent<HTMLSelectElement, HTMLSelectElement>) {
        setCurrTheme(e.target.value as theme)
    }

    useEffect(() => {
        localStorage.setItem('theme', currtheme)
        document.documentElement.setAttribute('data-theme', currtheme)
    }, [currtheme])

    return (
        <select className="theme-select" onChange={handleThemeChange} value={currtheme}>
            <option value='light'>light Theme</option>
            <option value='dark'>dark Theme</option>
            <option value='high-contrast'>High Contrast</option>

        </select>
        )
}

export default ThemeButton
