import { BASE_URL } from "../constants/url";
import styled from "styled-components";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import MyContext from '../contexts/MyContext';
import TrendingList from "../components/trending";
import Header from "../constants/header";
import axios from "axios";
import { ReactTagify } from "react-tagify"
import { useNavigate } from "react-router-dom";

export const Timeline = () => {
    const { token, user, config, counter, setCounter } = useContext(MyContext);
    const [posts, setPosts] = useState([]);
    const [postsLikes, setPostsLikes] = useState([])    
    const [form, setForm] = useState({description: "", link: ""});
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const navigate = useNavigate()    

    // Alterar a URL
    const getPostLikes = () => {
        posts.forEach(post => {
            const request = axios.get("http://localhost:5000/likes", {id: post.id});
            request.then((res) => {
                const newPostsLikes = [...postsLikes, res.data]
                setPostsLikes(newPostsLikes);
        });
        request.catch((err) => {
            alert("Algo deu errado e a culpa é nossa. =/");
            console.log(err);
        });
        })
    }

    //ID de todos os posts curtidos por esse usuário
    const userPostsLiked = [];
    postsLikes.forEach(postLikes => {
        postLikes.forEach(postLike => {
            if (postLike.user_id === user.id) {
                userPostsLiked.push(postLike.post_id)
            }
        })
    })
    
    const getPosts = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/timeline`, config);
            setPosts(res.data);
        } catch (error) {
            setErrorMessage(true);
        }
    };

    const openNewTab = url => {
        window.open(url, '_blank').focus();
    };
    
      useEffect(() => {
        getPosts();
        getPostLikes();
    }, [setErrorMessage]);    

    const likeHandler = (postId) => {
        const request = axios.post("http://localhost:5000/likes", config, {id: postId});
            request.then((res) => {
            
        });
        request.catch((err) => {
            alert("Algo deu errado e a culpa é nossa. =/");
            console.log(err);
        });
    }

    const addHashtag = async (name) => {
        try {
            await axios.post(`${BASE_URL}/hashtag`, { name }, config);
            setCounter(counter + 1)
        } catch (err) {
            console.log(err);
        }
    }

    const ListofPosts = post => {
        const {id, user_id, description, link, user} = post;

        //Estilo da hashtag
        const tagStyle = {
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer'
        };

        return (
            <PostsContainer>
                <ProfilePicture
                    src={user.photo}
                    alt="profile picture"
                />
                <Post>
                    <Username>{user.name}</Username>
                        <ReactTagify
                            tagStyle={tagStyle}
                            tagClicked={(tag) => {
                                navigate(`/hashtag/${tag.replace('#', '')}`)
                            }}
                        >
                            <p>{description}</p>
                        </ReactTagify>
                    <LinkContainer>
                        <LinkMetaData onClick={() => openNewTab(link.address)}>
                            <LinkTitle>{link.title}</LinkTitle>
                            <LinkDescription>{link.hint}</LinkDescription>
                            <LinkUrl>{link.address}</LinkUrl>
                        </LinkMetaData>
                        <LinkImage
                            src={link.image}
                            alt="icon of text"
                        />
                    </LinkContainer>
                </Post>
                <LikeIcon onClick={()=>likeHandler(id)}>
                    {userPostsLiked.includes(id) ? <IoIosHeart color="red" size={"30px"} /> : <IoIosHeartEmpty size={"30px"} />}
                </LikeIcon>
            </PostsContainer>
        );
    };

    const Posts = () => {
        if (!posts) {
            return <Message>Loading...</Message>
        } else if (posts.length === 0) {
            return <Message>There are no posts yet</Message>
        } else if (posts) {
            return (
                <ul>
                    {posts.map(p => <ListofPosts
                        key={p.id}
                        {...p}
                    />)}
                </ul>
            );
        }
    };

    const handleForm = e => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const validateURL = url => {
        const regex = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;

        return regex.test(url);
    };

    const submitForm = async () => {
        setLoading(true);

        const validURL = validateURL(form.link);
        const descriptionWords = form.description.split(" ")

        if (!validURL) {
            setLoading(false);
            return alert("You must choose a valid link!");
        }

        try {
            descriptionWords.map((w) => {
                if (w.includes("#")) {
                    addHashtag(w.replace("#", ""))
                }
            })

            await axios.post(`${BASE_URL}/timeline`, form, config);

            setLoading(false);
            setForm({description: "", link: ""});
            getPosts();
        } catch (error) {
            setLoading(false);
            alert("Houve um erro ao publicar seu link");
        }

    };

    return (
        <>
             <Header/>
             <TimelineBackground>
                    <TimelineContainer>
                        <Title>timeline</Title>
                        <PublishContainer>
                            <ProfilePicture
                                src={user.photo}
                                alt="profile picture"
                            />
                            <Form>
                                <FormTitle>What are you going to share today?</FormTitle>
                                <LinkInput
                                    type="text"
                                    id="link"
                                    name="link"
                                    placeholder="http://..."
                                    value={form.link}
                                    onChange={handleForm}
                                    disabled={loading}
                                    required
                                />
                                <TextInput
                                    id="description"
                                    name="description"
                                    placeholder="Awesome article about #javascript"
                                    value={form.description}
                                    onChange={handleForm}
                                    disabled={loading}
                                />
                                {!loading
                                    ? <Button onClick={submitForm}>Publish</Button>
                                    : <Button disabled={loading}>Publishing</Button>
                                }
                            </Form>
                        </PublishContainer>
                        {!errorMessage
                            ? <Posts />
                            : <Message>An error occured while trying to fetch the posts, please refresh the page</Message>
                        }
                </TimelineContainer>

                <TrendingList/>
            </TimelineBackground>
        </>
    );
};



const TimelineBackground = styled.div`
    background-color: #333333;
    display: flex;
    justify-content: center;
`;

const TimelineContainer = styled.div`
    width: 616px;
    margin-right: 50px;
    padding-top: 70px;
`;

const Title = styled.h1`
    font-family: 'Oswald', sans-serif;
    font-size: 43px;
    color: #ffffff;
    margin-bottom: 43px;
`;

const PublishContainer = styled.div`
    width: 611px;
    height: 209px;
    padding: 16px;
    background-color: #ffffff;
    border-radius: 16px;
    display: flex;
    margin-bottom: 30px;
`;

const Message = styled.p`
    font-family: 'Lato', sans-serif;
    font-size: 20px;
    color: #ffffff;
`;

const ProfilePicture = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
`;

const Form = styled.form`
    padding-left: 18px;
    display: flex;
    flex-direction: column;
`;

const FormTitle = styled.h2`
    font-family: 'Lato', sans-serif;
    font-size: 20px;
    font-weight: 300;
    color: #707070;
    padding-top: 6px;
    padding-bottom: 10px;
`;

const LinkInput = styled.input`
    font-family: 'Lato', sans-serif;
    font-size: 15px;
    font-weight: 300;
    width: 503px;
    height: 30px;
    border-radius: 3px;
    background-color: #EFEFEF;
    border: none;
    margin-top: 5px;
    padding-left: 10px;
    &:focus {
        outline: none;
    }
`;

const TextInput = styled.textarea`
    font-family: 'Lato', sans-serif;
    font-size: 15px;
    font-weight: 300;
    width: 503px;
    height: 66px;
    border-radius: 3px;
    background-color: #EFEFEF;
    border: none;
    margin-top: 5px;
    padding-top: 5px;
    padding-left: 10px;
    resize: none;
    &:focus {
        outline: none;
    }
`;

const Button = styled.button`
    width: 112px;
    height: 31px;
    border: none;
    border-radius: 5px;
    margin-top: 5px;
    color: #ffffff;
    background-color: ${props => !props.disabled ? "#1877F2" : "#1154ab"};
    align-self: flex-end;
    cursor: pointer;
`;

const PostsContainer = styled.div`
    width: 611px;
    height: 276px;
    padding: 16px;
    margin-top: 16px;
    border-radius: 16px;
    color: #ffffff;
    background-color: #171717;
    display: flex;
`;

const Post = styled.li`
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    padding-left: 18px;
`;

const Username = styled.h3`
    font-size: 19px;
    padding-top: 6px;
`;

const Description = styled.div`
    font-size: 17px;
    color: #B7B7B7;
    padding-top: 10px;
`;

const LinkContainer = styled.div`
    width: 503px;
    height: 155px;
    border: 1px solid #4D4D4D;
    border-radius: 11px;
    margin-top: 10px;
    display: flex;
`;

const LinkMetaData = styled.div`
    width: 349px;
    padding: 24px;
`;

const LinkImage = styled.img`
    background-color: white;
    width: 154px;
    height: 155px;
    border-radius: 0px 12px 13px 0px;
`;

const LinkTitle = styled.h4`
    font-size: 16px;
    color: #CECECE;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const LinkDescription = styled.p`
    font-size: 11px;
    color: #9B9595;
    margin-top: 10px;
    max-height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const LinkUrl = styled.p`
    font-size: 11px;
    color: #CECECE;
    margin-top: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const LikeIcon = styled.div`
position: relative;
right: 560px;
top: 60px;
`;
