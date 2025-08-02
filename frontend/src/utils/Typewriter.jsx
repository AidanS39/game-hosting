import { useState, useEffect } from 'react'

const Typewriter = ({ text }) => {
    const [displayText, setDisplayText] = useState("")

    useEffect(() => {
        if (displayText.length < text.length) {
            const timerId = setTimeout(() => {
                setDisplayText(text.substring(0, displayText.length + 1))
            }, 100)
            return () => {
                clearTimeout(timerId);
            };
        }
    }, [displayText])

    return (
        <h2>{displayText}</h2>
    )
}

export default Typewriter