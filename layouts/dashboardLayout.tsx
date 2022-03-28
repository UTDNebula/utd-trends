import { ExpandableSearchGrid } from "../components/common/expandableSearchGrid"
import { TopMenu } from "../components/navigation/topMenu"
import {DashboardWrapper} from "../context/dashboardState";

function dashboardLayout({children}:{children:React.ReactNode}){
    return(
        <>
            <div className=" w-full bg-light h-full">
                <DashboardWrapper>
                    <TopMenu />
                    <ExpandableSearchGrid/>
                    <div className="w-full h-5/6 justify-center">
                        <div className="w-full h-5/6 relative min-h-full">
                            {children}
                        </div>
                    </div>
                </DashboardWrapper>
            </div>
        </>
    )
}

export default dashboardLayout