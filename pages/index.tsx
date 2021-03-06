import type {NextPage} from 'next';
import {useEffect, useState} from 'react';
import Head from 'next/head';
import ScrollMenu from '../components/Menu/ScrollMenu';
import styles from '../styles/Home.module.css';
import useStore from '../hooks/useStore';
import {
    getSession,
    GetSessionParams,
    signIn,
    useSession,
} from 'next-auth/react';
import {dispatch, getStore} from 'imus';
import Tab from '../models/Tab';
import dbConnect from '../utils/database';

export async function getServerSideProps(
    context: GetSessionParams | undefined,
) {
    const session = await getSession(context);
    if (!session) return {props: {initTabs: []}};
    await dbConnect();

    //@ts-ignore
    const tab = await Tab.findOne({$eq: {userId: session.account.sub}});
    return {
        props: {initTabs: tab?.tabs || []}, // will be passed to the page component as props
    };
}

const Home: NextPage = ({initTabs}: any) => {
    const {
        tabs,
        tabActive,
        lastSave,
        createTab,
        updateTab,
        changeTab,
        updateData,
    } = useStore(initTabs);
    const {data: session}: {data: any} = useSession();
    const [textAreaContent, setTextAreaContent] = useState('');

    const handleTabClick = (tabId: number) => {
        changeTab(+tabId);
    };

    useEffect(() => {
        if (tabs.length === 0 || !tabs) return;
        const found = tabs.find((tab) => tab.id === tabActive);
        if (found) setTextAreaContent(found.content);
    }, [tabs, tabActive]);

    return (
        <div className={styles.container}>
            <Head>
                <title>Notee</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.mainItem}>
                    {tabs.length > 0 && (
                        <ScrollMenu
                            items={tabs}
                            handleClickTab={handleTabClick}
                        />
                    )}
                    <button
                        className={styles.addBtn}
                        onClick={() => createTab()}
                    >
                        +
                    </button>
                    <button className={styles.saveBtn} onClick={updateData}>
                        Save
                    </button>
                </div>

                <div className={styles.mainItem}>
                    <div>{!session && <span>Browser (offline)</span>}</div>
                    {!session ? (
                        //@ts-ignore
                        <button onClick={signIn}>Login</button>
                    ) : (
                        <>
                            saved:{' '}
                            {lastSave.substring(0, lastSave.indexOf('GMT'))}
                            <div> Online: {session.account.name}</div>
                        </>
                    )}
                </div>
                <div></div>
            </main>
            <textarea
                value={textAreaContent}
                onChange={(e) => updateTab(tabActive, e.target.value)}
                placeholder={'>'}
            ></textarea>
        </div>
    );
};

export default Home;
