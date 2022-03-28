import { ReactNode } from "react"
import { ExpandableSearchGrid } from "../components/common/expandableSearchGrid"
import { TopMenu } from "../components/navigation/topMenu"

function dashboardLayout({children}:{children:React.ReactNode}){
    return(
        <>
            <div className=" w-full bg-light h-full">
                <TopMenu />
                <ExpandableSearchGrid/>
                <div className="w-full h-5/6 justify-center">
                    <div className="w-full h-5/6 relative min-h-full">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}

export default dashboardLayout