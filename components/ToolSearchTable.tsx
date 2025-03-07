import { Button, Pagination, Progress, Spinner, Table, TextInput, Toast } from 'flowbite-react'
import Link from 'next/link'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react';
import { FaArrowUp, FaStar, FaTable } from 'react-icons/fa';
import useSWR from 'swr';
import ToolTableRow from './ToolTableRow';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from "../util/supabase";
import toast from 'react-hot-toast';

const fetcher = (url:any) => axios.get(url).then(res => res.data)

export default function ToolSearchTable(props: any) {

    let maxPages = useRef(0);

    const { user, error } = useUser();
    const supabaseCallUser = supabase.auth.user()

    const userInfo = user || supabaseCallUser || null

    const [tablePreviewData, setTablePreviewData] = useState([])
    const [standardTableViewVisible, setStandardTableViewVisible] = useState(true)
    const [recentlyAddedTableViewVisible, setRecentlyAddedTableViewVisible] = useState(false)
    const [isSearching, setSearchState] = useState(false)
    const [page, setPage] = useState(1)

    const { data: standardData, error: standardError }: any = useSWR('/api/getEntries?get=standard', fetcher)
    const { data: recentlyAddedData, error: recentlyAddedError }: any = useSWR('/api/getEntries?get=recentlyAdded', fetcher)
    
    useEffect(() => {
        setTablePreviewData(standardData?.tools)
        maxPages.current = standardData?.count
    }, [standardData?.tools, standardData?.count])

    if (!standardData) return (
        <div className="mx-auto max-w-5xl p-5 text-white">
          <Progress
            progress={50}
            size="md"
            label="Loading tooldb..."
            labelPosition="outside"
            labelProgress={true}
          />
        </div>
      );
    
      if (standardError || recentlyAddedError){
        return (
            <div className="mx-auto max-w-5xl text-white">
                <Progress
                progress={100}
                size="md"
                color="red"
                label="An error occurred while loading tooldb"
                labelPosition="outside"
                labelProgress={true}
                />
            </div>
        );
      }

    const showSearchResults = async (searchTerm: string) => {

        if (searchTerm.length > 3){
    
            const response = await axios.get('/api/querySearch/' + encodeURIComponent(searchTerm) + "?page=1")
    
            if(response.data.length > 0){
                setTablePreviewData(response.data)
                setPage(1)
                maxPages.current = 1
            } else {
                setTablePreviewData([])
                setPage(1)
                maxPages.current = 1
            }

            setSearchState(true)

        } else {
            setTablePreviewData(standardData.tools)
            setSearchState(false)
            maxPages.current = standardData.count
        }
    
    }

    const changeView = (view: string) => {
        if (view === 'standard'){
            setStandardTableViewVisible(true)
            setRecentlyAddedTableViewVisible(false)
            setTablePreviewData(standardData.tools)
            setPage(1)
        } else if (view === 'recentlyAdded'){
            setStandardTableViewVisible(false)
            setRecentlyAddedTableViewVisible(true)
            setTablePreviewData(recentlyAddedData.tools)
            setPage(1)
        }
    }

    const changePage = async (pageNumber: number) => {

        let queriedTable;
        
        if(!isSearching && (pageNumber != page)){

            if(standardTableViewVisible){
                queriedTable = "standard"
            }else{
                queriedTable = "recentlyAdded"
            }
            
            try {
                const queryNextPage = await axios.get(`/api/getEntries?get=${queriedTable}&page=${pageNumber}`)
                setPage(pageNumber) 
                setTablePreviewData(queryNextPage.data.tools)
            } catch (error) {
                console.error("An error happened while trying to paginate through the results. Please inform a developer.")
            }
            
        }

    }

    const notifications = {
        "noLoginVote": () => toast.error('You need to login first before voting!', {icon: "🙈", position: "bottom-center", duration: 3000}),
        "voteAdded": (promise:Promise<{}>) => toast.promise(promise, {
          loading: 'Adding vote...',
          success: <b>Voted!</b>,
          error: <b>Sorry, an error happened. Please try again later.</b>
        }, {position: "bottom-center", duration: 2000}).then((r) => r).catch((error) => console.error(error)),
        "voteRemoved": (promise:Promise<{}>) => toast.promise(promise, {
            loading: 'Remove vote...',
            success: <b>Vote removed!</b>,
            error: <b>Sorry, an error happened. Please try again later.</b>
          }, {position: "bottom-center", duration: 2000}).then((r) => r).catch((error) => console.error(error)),
        "voteError": () => toast.error('An error occurred while trying to vote / unvote!', {position: "bottom-center", duration: 3000}),
    }

    return (
        <>
            <h3 className='text-center text-md text-white font-bold'>Search through {maxPages.current || <Spinner />} tools</h3>
            <div className='px-1'>
                <TextInput
                    id="large"
                    type="text"
                    sizing="lg"
                    placeholder='Search a tool...'
                    onChange={(e) => 
                        {
                            showSearchResults(e.target.value)
                        }
                    }
                />
            </div>
            <div className='flex flex-wrap justify-center px-1'>
                <div className='xs:mt-0 mt-2 sm:flex-1 flex-auto text-center sm:text-left'>
                    <Button.Group outline={true} >
                        <Button size="md" color="alternative" disabled={standardTableViewVisible} onClick={() => changeView("standard")}>
                            <FaArrowUp className="mr-1 h-4 w-4" />
                            {' '}Most Votes
                        </Button>
                        <Button size="md" color="alternative" disabled={recentlyAddedTableViewVisible} onClick={() => changeView("recentlyAdded")}>
                            <FaStar className="mr-1 h-4 w-4" />
                            {' '}Newest
                        </Button>
                    </Button.Group>
                </div>
                <div className='text-white sm:flex-1 flex-auto text-center sm:text-right gap-1'>
                    <Pagination
                        currentPage={page}
                        className="text-white text-sm"
                        layout="navigation"
                        onPageChange={(pageNumber) => changePage(pageNumber)}
                        showIcons={true}
                        totalPages={(Math.ceil(maxPages.current / 10)) || 1}
                    />
                    <p>Page <b>{page}</b> of <b>{(Math.ceil(maxPages.current / 10)) || <Spinner />}</b></p>
                </div>
            </div>
            <Table striped={true} className="whitespace-nowrap md:whitespace-normal table-auto" >
                <Table.Head>
                    <Table.HeadCell className='px-4 md:px-6'>
                    Tool
                    </Table.HeadCell>
                    <Table.HeadCell className='px-4 md:px-6 w-96'>
                    Categories
                    </Table.HeadCell>
                    <Table.HeadCell className='hidden sm:table-cell px-3 md:px-6'>
                    Links
                    </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {
                        tablePreviewData ? (
                            tablePreviewData.map((row: any, index: number) => {
                                return (
                                    <ToolTableRow key={row.id} row={row} notifications={notifications} userInfo={userInfo} showSubmittedBy={false} showCategories={true} />
                                )
                            })
                        ) : (
                            <Table.Row>
                                <Table.Cell>
                                    Sorry. We couldn&apos;t find your tool. 
                                    <br />Try with a few more letters, check for typos or submit your tool <Link href={"https://app.appsmith.com/app/submit-a-tool-to-tooldb/submittool-628dfd0f7901344ba8d28334"}><a className='text-blue-600 font-bold hover:text-cyan-600'>here</a></Link>.
                                </Table.Cell>
                                <Table.Cell></Table.Cell>
                                <Table.Cell className='hidden sm:table-cell px-3 md:px-6'></Table.Cell>
                            </Table.Row>
                        )}
                        <Table.Row>
                            <Table.Cell>
                                Submit your tool <br /> <Link href={"https://app.appsmith.com/app/submit-a-tool-to-tooldb/submittool-628dfd0f7901344ba8d28334"}><a className='text-blue-600 font-bold hover:text-cyan-600'>here on AppSmith</a></Link>.
                            </Table.Cell>
                            <Table.Cell></Table.Cell>
                            <Table.Cell className='hidden sm:table-cell px-3 md:px-6'></Table.Cell>
                        </Table.Row>
                </Table.Body>
            </Table>
            <div className="items-center justify-center text-center text-white gap-1">
                <Pagination
                    currentPage={page}
                    className="text-white text-sm"
                    layout="navigation"
                    onPageChange={(pageNumber) => changePage(pageNumber)}
                    showIcons={true}
                    totalPages={(Math.ceil(maxPages.current / 10)) || 1}
                />
                <p>Page <b>{page}</b> of <b>{(Math.ceil(maxPages.current / 10)) || <Spinner />}</b></p>
            </div>
        </>
    )

}