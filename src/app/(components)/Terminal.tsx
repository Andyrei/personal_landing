'use client';
import { useEffect, useRef, useState } from 'react';
import '../styles/component-terminal.css';
import { abort } from 'process';

interface CommandResult {
    output: string;
    isSpecialCommand?: boolean;
}

/**
 * TODO: [ ] - Add more commands like `cd` -> Example: `cd projects` to navigate to the projects "directory"
 * TODO: [ ] - 
 */

export default function Terminal(){

    const [isTerminalOpen, setTerminalOpen] = useState(true);
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState<Array<{ time: string; cmd: string }>>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const outputRef = useRef<HTMLDivElement>(null);
    
    const commands = {
        ls: () => ({ output: 'projects/  skills/  experience/  contact/  about.txt' }),
        whoami: () => ({ output: 'andydrei - Full Stack Developer' }),
        pwd: () => ({ output: '/Users/andydrei/personal_portfolio' }),
        date: () => ({ output: new Date().toLocaleString() }),
        clear: () => ({ output: 'CLEAR_COMMAND', isSpecialCommand: true }),
        help: () => ({ output: 'Available commands: ls, whoami, pwd, date, clear, help, cat, echo' }),
        cd: (args?: string) => {
            if (!args || args.trim() === '') return { output: 'cd: missing arguments! \n OPTIONS: cd <directory>  (e.g., cd projects)' };
            const directories = ['projects', 'skills', 'experience', 'contact', 'about'];
            const dir = args.trim();
            if (directories.includes(dir)) {
                window.location.href = `/${dir}`;
                return { output: `Redirecting to /${dir}...` };
            } else {
                return { output: `cd: ${dir}: No such file or directory` };
            }
        },
        cat: (args?: string) => {
            if (!args || args.trim() === '') return { output: 'cat: missing file operand! \n OPTIONS: cat <file>  (e.g., cat about.txt)' };
            
            const files: Record<string, string> = {
                'about.txt': 'Hi! I\'m a passionate developer who loves creating innovative solutions...',
                'skills': 'JavaScript, TypeScript, React, Node.js, CSS, HTML, Python',
                'experience': '3+ years in full stack development, building web apps and APIs.',
                'contact': 'Email: andydrei@example.com'
            };
            
            return files[args] 
                ? { output: files[args] }
                : { output: `cat: ${args}: No such file or directory` };
        },
        echo: (args?: string) => ({ output: args || '' })
    };
    
    const getAutoComplete = (input: string): string | null => {
        const trimmedInput = input.trim().toLowerCase();
        if (trimmedInput === '') return null;
        const [command, ...args] = trimmedInput.split(' ');
        
        if (args.length === 0) {
            const availableCommands = Object.keys(commands);
            const matches = availableCommands.filter(cmd => cmd.startsWith(command));
            return matches.length === 1 ? matches[0] : null;
        }

        if (command === 'cat') {
            if (args.length === 0) return ``;
            const files = ['about.txt', 'skills', 'experience', 'contact'];
            const matches = files.filter(file => file.startsWith(args[0]));
            return matches.length === 1 ? `cat ${matches[0]}` : null;
        }
        
        return null;
    };

    const processCommand = (cmd: string): CommandResult => {
        const trimmedCmd = cmd.trim().toLowerCase();
        const [command, ...args] = trimmedCmd.split(' ');
        const argsString = args.join(' ');

        if (command in commands) {
            return (commands as any)[command](argsString);
        }

        return { output: `Command not found: ${cmd}. Type 'help' for available commands.` };
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleOutputRun(e);
        } else if (e.key === 'Tab') {
            e.preventDefault(); // Prevent default tab behavior
            
            const autoComplete = getAutoComplete(command);
            if (autoComplete) {
                setCommand(autoComplete);
            } else {
                // Show available commands if no match
                const availableCommands = Object.keys(commands);
                const partialMatches = availableCommands.filter(cmd => 
                    cmd.startsWith(command.trim().toLowerCase())
                );
                
                if (partialMatches.length > 1) {
                        setOutput(prevOutput => [
                            ...prevOutput,
                            {
                                time: getCurrentTime(),
                                cmd: `$ ${command}`
                            },
                            {
                                time: '',
                                cmd: `Available completions: ${partialMatches.join(', ')}`
                            }
                        ]);
                }
            }
        } else if (e.key === 'ArrowUp') {
            setHistoryIndex(prevIndex => {
                const newIndex = Math.max(0, prevIndex === -1 ? history.length - 1 : prevIndex - 1);
                setCommand(history[newIndex] || '');
                return newIndex;
            });
        } else if (e.key === 'ArrowDown') {
            setHistoryIndex(prevIndex => {
                const newIndex = Math.min(history.length - 1, prevIndex + 1);
                setCommand(history[newIndex] || '');
                return newIndex;
            });
        } else if (e.key === 'Escape') {
            setCommand(''); // Clear command input on Escape
        }
    };

    useEffect(() => {
        const defaultOutput = [
            { time: getCurrentTime(), cmd: 'Welcome to the terminal!' },
            { time: getCurrentTime(), cmd: 'Type a command and press Enter to execute.' },
            { time: getCurrentTime(), cmd: 'Use Tab for auto-completion.' }
        ];
        setOutput(defaultOutput);
    }, []);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const toggleTerminal = () => {
        setTerminalOpen(!isTerminalOpen);
    };

    const handleOutputRun = (e: any) => {
        if (command.trim() === '') return;

        const result = processCommand(command);

        if (result.isSpecialCommand && result.output === 'CLEAR_COMMAND') {
            setOutput([]);
            setCommand('');
            setHistory([]);
            setHistoryIndex(-1);
            return;
        }

        setOutput(prevOutput => [
            ...prevOutput,
            {
                time: getCurrentTime(),
                cmd: command
            },
            {
                time: '',
                cmd: result.output
            }
        ]);
        setHistory(prevHistory => [...prevHistory, command]);
        setHistoryIndex(-1);
        setCommand('');
    };

    return <>
        <div className="terminal-container">
           <div className={`terminal-wrapper ${isTerminalOpen ? 'terminal-open' : 'terminal-closed'}`}>
                <div className="terminal-header">
                    <span className="terminal-header-title">Terminal</span>
                    <span className="terminal-header-controls">
                        <button className="btn terminal-header-button" onClick={toggleTerminal}>X</button>
                    </span>
                </div>
                <div className='terminal-content'>
                    <div className="terminal-output" ref={outputRef}>
                        <div className="terminal-body">
                            <div className="terminal-body-content">
                                {output && output.map((item, index) => (
                                    <div key={index} className="terminal-output-item">
                                        <span className="terminal-output-time">{item.time} ~$ </span>
                                        <span className="terminal-output-command">{item.cmd}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* <div className="terminal-footer">
                            <span className="terminal-footer-text">Type a command and press Enter</span>
                            <span className="terminal-footer-controls">
                                <button className="terminal-footer-button">Clear</button>
                            </span>
                        </div> */}
                    </div>
                    <div className="terminal-input-wrapper">
                        <label htmlFor="TerminalInput" className="terminal-input-label">
                            <span>Command:</span>
                            <input type="text" className="terminal-input" name="terminal-input" id="TerminalInput" placeholder="Enter command" value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={handleKeyPress} />
                        </label>
                        <button className="btn terminal-input-button" onClick={handleOutputRun}>
                            {/* <span className=''>Execute</span> */}
                            <span>▶️</span>
                        </button>
                    </div>
                </div>
           </div>
        </div>
    </>
}