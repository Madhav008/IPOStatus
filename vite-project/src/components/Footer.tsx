import { Separator } from "./ui/separator"

const Footer = () => {
    return (
        <>
            <Separator />
            <div className="px-4 pt-16 mx-auto  md:px-24 lg:px-8">
                <div className="gap-10 row-gap-6 mb-8 flex justify-evenly w-full">
                    <div className="sm:col-span-2 pl-8">
                        <a href="/" aria-label="Go home" title="Company" className="inline-flex items-center">
                            <svg className="w-8 text-deep-purple-accent-400" viewBox="0 0 24 24" stroke-linejoin="round" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" stroke="currentColor" fill="none">
                                <rect x="3" y="1" width="7" height="12"></rect>
                                <rect x="3" y="17" width="7" height="6"></rect>
                                <rect x="14" y="1" width="7" height="6"></rect>
                                <rect x="14" y="11" width="7" height="12"></rect>
                            </svg>
                            <span className="ml-2 text-xs font-bold tracking-wide uppercase">IPO STATUS CHECK</span>
                        </a>
                        <div className="mt-6 lg:max-w-sm">
                            <p className="text-xs font-semibold  ">
                                Transforming the way you track IPO allotment bulk status for a smarter investment experience.
                            </p>

                        </div>
                    </div>
                    <div className="space-y-2 text-sm p-6 ">
                        <p className="text-base font-bold tracking-wide ">Contacts</p>
                        <div className="flex flex-wrap">
                            <p className="mr-1 ">Phone:</p>
                            <a href="tel:+91 85297 78777" aria-label="Our phone" title="Our phone" className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800">+91 85297-78777</a>
                        </div>
                        <div className="flex flex-wrap">
                            <p className="mr-1 ">Email:</p>
                            <a href="mailto:Ipohissar@gmail.com" aria-label="Our email" title="Our email" className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800">Ipohissar@gmail.com</a>
                        </div>
                        <div className="flex">
                            <p className="mr-1 ">Address:</p>
                            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" aria-label="Our address" title="Our address" className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800">
                                Hissar
                            </a>
                        </div>
                    </div>
                    
                    
                </div>
                <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t lg:flex-row">
                    <p>
                        © Copyright 2023. All rights reserved.
                    </p>

                </div>
            </div>
        </>
    )
}

export default Footer