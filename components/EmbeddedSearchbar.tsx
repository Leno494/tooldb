import { Table, TextInput } from 'flowbite-react'
import Link from 'next/link'
import axios from 'axios'
import { useState } from 'react';
import ToolTableRow from './ToolTableRow';


export default function EmbeddedSearchbar(props: any) {

    const [results, setResults] = useState([])
    const [tableVisible, setTableVisibility] = useState(false)

    const showSearchResults = async (searchTerm: string) => {

        if (searchTerm.length > 3){

            setTableVisibility(true)
    
            const response = await axios.get('/api/querySearch/' + encodeURIComponent(searchTerm) + "?page=1")
    
            if(response.data.length > 0){           
                setResults(response.data)
            } else {
                setResults([])
            }

        } else {
            setTableVisibility(false)
            setResults([])
        }
    
    }

    return (
        <div className='relative w-full'>
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
            {
                tableVisible ? (
                    <div className='absolute w-full' style={{zIndex: "9999999999"}}>
                <Table striped={true} className='max-h-96'>
                    <Table.Head>
                        <Table.HeadCell>
                        Tool name
                        </Table.HeadCell>
                        <Table.HeadCell>
                        Categories
                        </Table.HeadCell>
                        <Table.HeadCell>
                        Links
                        </Table.HeadCell>

                    </Table.Head>
                    <Table.Body className="divide-y">
                        {
                            results.length > 0 ? (
                                results.map((row: any, index: number) => {
                                    return (
                                        <ToolTableRow key={row.id} row={row} showSubmittedBy={false} showCategories={true} />
                                    )
                                })
                            ) : (
                                <Table.Row>
                                    <Table.Cell>
                                        Sorry. We couldn&apos;t find your tool. 
                                        <br />Try with a few more letters, check for typos or submit your tool on GitHub with <Link href={"https://app.appsmith.com/app/submit-a-tool-to-tooldb/submittool-628dfd0f7901344ba8d28334"}><a className='text-blue-600 font-bold hover:text-cyan-600'>an issue</a></Link>.
                                    </Table.Cell>
                                    <Table.Cell></Table.Cell>
                                    <Table.Cell></Table.Cell>
                                </Table.Row>
                            )}
                            <Table.Row>
                                <Table.Cell>
                                    Submit your tool <br /> <Link href={"https://app.appsmith.com/app/submit-a-tool-to-tooldb/submittool-628dfd0f7901344ba8d28334"}><a className='text-blue-600 font-bold hover:text-cyan-600'>here on AppSmith</a></Link>.
                                </Table.Cell>
                                <Table.Cell></Table.Cell>
                                <Table.Cell></Table.Cell>
                            </Table.Row>
                    </Table.Body>
                </Table>
            </div>
                ) : null
            }
        </div>
    )

}